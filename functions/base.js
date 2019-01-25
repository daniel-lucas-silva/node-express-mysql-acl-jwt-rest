import User from "../models/user";

const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
const crypto = require("crypto");
const algorithm = "aes-256-ecb";
const password = process.env.JWT_SECRET;
const requestIp = require("request-ip");

const buildSort = (sort, order) => {
  const sortBy = {};
  sortBy[sort] = order;
  return sortBy;
};

export const removeExtensionFromFile = file => {
  return file
    .split(".")
    .slice(0, -1)
    .join(".")
    .toString();
};

export const getIP = req => requestIp.getClientIp(req);

export const getBrowserInfo = req => req.headers["user-agent"];

export const getCountry = req =>
  req.headers["cf-ipcountry"] ? req.headers["cf-ipcountry"] : "XX";

export const emailExists = async email => {
  return new Promise((resolve, reject) => {
    User.findOne({
      where: {
        email
      }
    })
      .then(result => {
        if (result) {
          reject(buildErrObject(422, "EMAIL_ALREADY_EXISTS"));
        }
        resolve(false);
      })
      .catch(err => {
        reject(buildErrObject(422, err.message));
      });
  });
};

export const emailExistsExcludingMyself = async (id, email) => {
  return new Promise((resolve, reject) => {
    User.findOne({ where: { email, id } })
      .then(result => {
        if (result) {
          reject(buildErrObject(422, "EMAIL_ALREADY_EXISTS"));
        }
        resolve(false);
      })
      .catch(err => {
        reject(buildErrObject(422, err.message));
      });
  });
};

export const sendEmail = async (data, callback) => {
  const auth = {
    auth: {
      api_key: process.env.EMAIL_SMTP_API_MAILGUN,
      domain: process.env.EMAIL_SMTP_DOMAIN_MAILGUN
    }
  };
  const transporter = nodemailer.createTransport(mg(auth));
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_ADDRESS}>`,
    to: `${data.user.name} <${data.user.email}>`,
    subject: data.subject,
    html: data.htmlMessage
  };
  transporter.sendMail(mailOptions, err => {
    if (err) {
      return callback(false);
    }
    return callback(true);
  });
};

export const sendRegistrationEmailMessage = async user => {
  const subject = "Verirify your email at myProject";
  const htmlMessage = `<p>Helo ${
    user.name
  }.</p> <p>Welcome! To verify your email, please click in this link:</p> <p>${
    process.env.FRONTEND_URL
  }/verify/${user.verification}</p> <p>Thank you.</p>`;
  const data = {
    user,
    subject,
    htmlMessage
  };
  const email = {
    subject,
    htmlMessage,
    verification: user.verification
  };

  if (process.env.NODE_ENV === "production") {
    this.sendEmail(data, messageSent =>
      messageSent
        ? console.log(`Email SENT to: ${user.email}`)
        : console.log(`Email FAILED to: ${user.email}`)
    );
  } else if (process.env.NODE_ENV === "development") {
    console.log(email);
  }
};

export const sendResetPasswordEmailMessage = async user => {
  const subject = "Password recovery";
  const htmlMessage = `<p>To recover the password for user: ${
    user.email
  }</p> <p>click the following link:</p> <p>${process.env.FRONTEND_URL}/reset/${
    user.verification
  }</p> <p>If this was a mistake, you can ignore this message.</p> <p>Thank you.</p>`;
  const data = {
    user,
    subject,
    htmlMessage
  };
  const email = {
    subject,
    htmlMessage,
    verification: user.verification
  };
  if (process.env.NODE_ENV === "production") {
    this.sendEmail(data, messageSent =>
      messageSent
        ? console.log(`Email SENT to: ${user.email}`)
        : console.log(`Email FAILED to: ${user.email}`)
    );
  } else if (process.env.NODE_ENV === "development") {
    console.log(email);
  }
};

export const encrypt = text => {
  const cipher = crypto.createCipher(algorithm, password);
  let crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
};

export const decrypt = text => {
  const decipher = crypto.createDecipher(algorithm, password);
  try {
    let dec = decipher.update(text, "hex", "utf8");
    dec += decipher.final("utf8");
    return dec;
  } catch (err) {
    return err;
  }
};

export const handleError = (res, err) => {
  // Prints error in console
  if (process.env.NODE_ENV === "development") {
    console.log(err);
  }
  // Sends error to user
  res.status(err.code).json({
    errors: {
      msg: err.message
    }
  });
};

export const buildErrObject = (code, message) => {
  return {
    code,
    message
  };
};

export const buildSuccObject = msg => {
  return {
    msg
  };
};

export const isIDGood = async id => {
  return new Promise((resolve, reject) => {
    const goodID = String(id).match(/^[0-9a-fA-F]{24}$/);
    return goodID
      ? resolve(id)
      : reject(this.buildErrObject(422, "ID_MALFORMED"));
  });
};

export const checkQueryString = async query => {
  return new Promise((resolve, reject) => {
    try {
      return typeof query !== "undefined"
        ? resolve(JSON.parse(query))
        : resolve({});
    } catch (err) {
      console.log(err.message);
      return reject(
        this.buildErrObject(422, "BAD_FORMAT_FOR_FILTER_USE_JSON_FORMAT")
      );
    }
  });
};

export const listInitOptions = async req => {
  const order = req.query.order || -1;
  const sort = req.query.sort || "createdAt";
  const sortBy = buildSort(sort, order);
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const options = {
    sort: sortBy,
    lean: true,
    page,
    limit
  };
  return options;
};

// Hack for mongoose-paginate, removes 'id' from results
export const cleanPaginationID = result => {
  result.docs.map(element => delete element.id);
  return result;
};

export const hash = (user, salt, next) => {
  bcrypt.hash(user.password, salt, null, (error, newHash) => {
    if (error) {
      return next(error);
    }
    user.password = newHash;
    return next();
  });
};

export const genSalt = (user, SALT_FACTOR, next) => {
  bcrypt.genSalt(SALT_FACTOR, (err, salt) => {
    if (err) {
      return next(err);
    }
    return hash(user, salt, next);
  });
};
