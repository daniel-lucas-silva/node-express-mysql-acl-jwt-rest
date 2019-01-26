// import ForgotPassword from "../models/forgotPassword";
const {
  encrypt,
  getIP,
  getBrowserInfo,
  getCountry,
  buildErrObject,
  handleError,
  emailExists,
  sendRegistrationEmailMessage,
  sendResetPasswordEmailMessage
} = require("./base");
// import uuid from "uuid";
const { addHours } = require("date-fns");
// import { matchedData } from "express-validator/filter";

const models = require("../db/models");
const { jwtSecret, jwtExpiration } = require("../config/app.json");
const jwt = require("jsonwebtoken");

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
  return jwt.sign(obj, jwtSecret, { expiresIn: jwtExpiration });
};

exports.userExists = async (email, username) => {
  return new Promise((resolve, reject) => {
    models.User.findOne({
      where: {
        $or: [
          {
            email: {
              $eq: email
            }
          },
          {
            username: {
              $eq: username
            }
          }
        ]
      }
    })
      .then(result => {
        if (result) {
          let data = {};
          if (result.email == email) data.email = "EMAIL_ALREADY_EXISTS";
          if (result.username == username)
            data.username = "USERNAME_ALREADY_EXISTS";

          reject(buildErrObject(422, "USER_ALREADY_EXISTS", data || null));
        }
        resolve(false);
      })
      .catch(err => {
        reject(buildErrObject(422, err.message));
      });
  });
};

exports.saveUserAccessAndReturnToken = async (req, user) => {
  return new Promise((resolve, reject) => {
    models.UserAccess.create({
      email: user.email,
      ip: getIP(req),
      browser: getBrowserInfo(req)
      // country: getCountry(req)
    })
      .then(result => {
        console.log(user.id);
        const userInfo = this.setUserInfo(user);
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

exports.setUserInfo = function(req) {
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

exports.blockUser = async user => {
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

exports.saveLoginAttemptsToDB = async user => {
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

exports.checkPassword = async (password, user) => {
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

exports.checkLoginAttemptsAndBlockExpires = async user => {
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

exports.userIsBlocked = async user => {
  return new Promise((resolve, reject) => {
    if (user.blockExpires > new Date()) {
      reject(buildErrObject(409, "BLOCKED_USER"));
    }
    resolve(true);
  });
};

exports.findUser = async identity => {
  return new Promise((resolve, reject) => {
    models.User.findOne({
      where: {
        $or: [
          {
            email: {
              $eq: identity
            }
          },
          {
            username: {
              $eq: identity
            }
          }
        ]
      }
    })
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

exports.passwordsDoNotMatch = async user => {
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

exports.registerUser = async req => {
  return new Promise((resolve, reject) => {
    console.log("BODY", req.body);
    const { name, username, email, password } = req.body;

    models.User.create({
      name,
      username,
      email,
      password,
      role: "user"
    })
      .then(result => {
        resolve(result);
      })
      .catch(err => {
        reject(buildErrObject(422, err.message));
      });
  });
};

exports.returnRegisterToken = (item, userInfo) => {
  userInfo.verification = item.verification;
  return {
    token: generateToken(item.id),
    user: userInfo
  };
};

exports.verificationExists = async id => {
  return new Promise((resolve, reject) => {
    models.User.findOne({
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

exports.verifyUser = async user => {
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

// exports.markResetPasswordAsUsed = async (req, forgot) => {
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

exports.updatePassword = async (password, user) => {
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

exports.findUserToResetPassword = async email => {
  return new Promise((resolve, reject) => {
    models.User.findOne({ where: { email } })
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

// exports.findForgotPassword = async id => {
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

// exports.saveForgotPassword = async req => {
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
    models.User.findById(data.id)
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
