import jwt from "jsonwebtoken";
import User from "../models/user";
import UserAccess from "../models/userAccess";
// import ForgotPassword from "../models/forgotPassword";
import {
  encrypt,
  getIP,
  getBrowserInfo,
  getCountry,
  buildErrObject,
  handleError,
  emailExists,
  sendRegistrationEmailMessage,
  sendResetPasswordEmailMessage
} from "./base";
import uuid from "uuid";
import { addHours } from "date-fns";
import { matchedData } from "express-validator/filter";
import { JWT_SECRET, JWT_EXPIRATION } from "../config/config";

const HOURS_TO_BLOCK = 2;
const LOGIN_ATTEMPTS = 5;

const generateToken = user => {
  const obj = {
    id: user
  };
  // return encrypt(
  //   jwt.sign(obj, process.env.JWT_SECRET, {
  //     expiresIn: process.env.JWT_EXPIRATION
  //   })
  // );
  return jwt.sign(obj, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION
  });
};

const setUserInfo = req => {
  const { id, name, email, role, verified } = req;
  const user = {
    id,
    name,
    email,
    role,
    verified
  };
  return user;
};

const saveUserAccessAndReturnToken = async (req, user) => {
  return new Promise((resolve, reject) => {
    UserAccess.create({
      email: user.email,
      ip: getIP(req),
      browser: getBrowserInfo(req),
      country: getCountry(req)
    })
      .then(result => {
        const userInfo = setUserInfo(user);
        // Returns data with access token
        resolve({
          token: generateToken(user.id),
          user: userInfo
        });
      })
      .catch(err => {
        reject(buildErrObject(422, err.message));
      });
  });
};

const blockUser = async user => {
  return new Promise((resolve, reject) => {
    user.blockExpires = addHours(new Date(), HOURS_TO_BLOCK);
    user.save((err, result) => {
      if (err) {
        reject(buildErrObject(422, err.message));
      }
      if (result) {
        resolve(buildErrObject(409, "BLOCKED_USER"));
      }
    });
  });
};

const saveLoginAttemptsToDB = async user => {
  return new Promise((resolve, reject) => {
    user
      .save()
      .then(result => {
        if (result) {
          resolve(true);
        }
      })
      .catch(err => {
        reject(buildErrObject(422, err.message));
      });
  });
};

const checkPassword = async (password, user) => {
  return new Promise((resolve, reject) => {
    user.comparePassword(password, (err, isMatch) => {
      if (err) {
        reject(buildErrObject(422, err));
      }
      if (!isMatch) {
        resolve(false);
      }
      resolve(true);
    });
  });
};

const blockIsExpired = ({ loginAttempts, blockExpires }) =>
  loginAttempts > LOGIN_ATTEMPTS && blockExpires <= new Date();

const checkLoginAttemptsAndBlockExpires = async user => {
  return new Promise((resolve, reject) => {
    // Let user try to login again after blockexpires, resets user loginAttempts
    if (blockIsExpired(user)) {
      user.loginAttempts = 0;
      user.save((err, result) => {
        if (err) {
          reject(buildErrObject(422, err.message));
        }
        if (result) {
          resolve(true);
        }
      });
    } else {
      // User is not blocked, check password (normal behaviour)
      resolve(true);
    }
  });
};

const userIsBlocked = async user => {
  return new Promise((resolve, reject) => {
    if (user.blockExpires > new Date()) {
      reject(buildErrObject(409, "BLOCKED_USER"));
    }
    resolve(true);
  });
};

const findUser = async email => {
  return new Promise((resolve, reject) => {
    User.findOne({ where: { email } })
      .then(result => {
        if (!result) {
          reject(buildErrObject(404, "USER_DOES_NOT_EXISTS"));
        }
        resolve(result);
      })
      .catch(err => {
        reject(buildErrObject(422, err.message));
      });
  });
};

const passwordsDoNotMatch = async user => {
  user.loginAttempts += 1;
  await saveLoginAttemptsToDB(user);
  return new Promise((resolve, reject) => {
    if (user.loginAttempts <= LOGIN_ATTEMPTS) {
      resolve(buildErrObject(409, "WRONG_PASSWORD"));
    } else {
      resolve(blockUser(user));
    }
    reject(buildErrObject(422, "ERROR"));
  });
};

const registerUser = async req => {
  return new Promise((resolve, reject) => {
    const { name, username, email, password } = req.body;

    User.create({
      name,
      username,
      email,
      password,
      role: "user"
    })
      .then(result => {
        console.log("AQUIII");
        resolve(result);
      })
      .catch(err => {
        reject(buildErrObject(422, err.message));
      });
  });
};

const returnRegisterToken = (item, userInfo) => {
  userInfo.verification = item.verification;
  return {
    token: generateToken(item._id),
    user: userInfo
  };
};

const verificationExists = async id => {
  return new Promise((resolve, reject) => {
    User.findOne({
      where: {
        verification: id,
        verified: false
      }
    })
      .then(result => {
        if (!result) {
          reject(buildErrObject(404, "NOT_FOUND_OR_ALREADY_VERIFIED"));
        }
        resolve(result);
      })
      .catch(err => {
        reject(buildErrObject(422, err.message));
      });
  });
};

const verifyUser = async user => {
  return new Promise((resolve, reject) => {
    user.verified = true;
    user
      .save()
      .then(result => {
        resolve({ email: result.email, verified: result.verified });
      })
      .catch(err => {
        reject(buildErrObject(422, err.message));
      });
  });
};

// const markResetPasswordAsUsed = async (req, forgot) => {
//   return new Promise((resolve, reject) => {
//     forgot.used = true;
//     forgot.ipChanged = getIP(req);
//     forgot.browserChanged = getBrowserInfo(req);
//     forgot.countryChanged = getCountry(req);
//     forgot.save((err, item) => {
//       if (err) {
//         reject(buildErrObject(422, err.message));
//       }
//       if (!item) {
//         reject(buildErrObject(404, "NOT_FOUND"));
//       }
//       resolve({
//         msg: "PASSWORD_CHANGED"
//       });
//     });
//   });
// };

const updatePassword = async (password, user) => {
  return new Promise((resolve, reject) => {
    user.password = password;
    user
      .save()
      .then(result => {
        if (!result) {
          reject(buildErrObject(404, "NOT_FOUND"));
        }
        resolve(result);
      })
      .catch(err => {
        reject(buildErrObject(422, err.message));
      });
  });
};

const findUserToResetPassword = async email => {
  return new Promise((resolve, reject) => {
    User.findOne({ where: { email } })
      .then(result => {
        if (!result) {
          reject(buildErrObject(404, "NOT_FOUND"));
        }
        resolve(result);
      })
      .catch(err => {
        reject(buildErrObject(422, err.message));
      });
  });
};

// const findForgotPassword = async id => {
//   return new Promise((resolve, reject) => {
//     ForgotPassword.findOne(
//       {
//         verification: id,
//         used: false
//       },
//       (err, item) => {
//         if (err) {
//           reject(buildErrObject(422, err.message));
//         }
//         if (!item) {
//           reject(buildErrObject(404, "NOT_FOUND_OR_ALREADY_USED"));
//         }
//         resolve(item);
//       }
//     );
//   });
// };

// const saveForgotPassword = async req => {
//   return new Promise((resolve, reject) => {
//     const forgot = new ForgotPassword({
//       email: req.body.email,
//       verification: uuid.v4(),
//       ipRequest: getIP(req),
//       browserRequest: getBrowserInfo(req),
//       countryRequest: getCountry(req)
//     });
//     forgot.save((err, item) => {
//       if (err) {
//         reject(buildErrObject(422, err.message));
//       }
//       resolve(item);
//     });
//   });
// };

// const forgotPasswordResponse = item => {
//   return {
//     msg: "RESET_EMAIL_SENT",
//     verification: item.verification
//   };
// };

const checkPermissions = async (data, next) => {
  return new Promise((resolve, reject) => {
    User.findById(data.id)
      .then(result => {
        if (!result) {
          reject(buildErrObject(404, "NOT_FOUND"));
        }
        if (data.roles.indexOf(result.role) > -1) {
          return resolve(next());
        }
        return reject(buildErrObject(401, "UNAUTHORIZED"));
      })
      .catch(err => {
        reject(buildErrObject(422, err.message));
      });
  });
};

export {
  generateToken,
  setUserInfo,
  saveUserAccessAndReturnToken,
  blockUser,
  saveLoginAttemptsToDB,
  checkPassword,
  blockIsExpired,
  checkLoginAttemptsAndBlockExpires,
  userIsBlocked,
  findUser,
  passwordsDoNotMatch,
  registerUser,
  returnRegisterToken,
  verificationExists,
  verifyUser,
  // markResetPasswordAsUsed,
  updatePassword,
  findUserToResetPassword,
  // findForgotPassword,
  // saveForgotPassword,
  // forgotPasswordResponse,
  checkPermissions
};
