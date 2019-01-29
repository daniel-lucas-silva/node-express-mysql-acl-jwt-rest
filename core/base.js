const crypto = require('crypto');
const requestIp = require('request-ip');

const { User } = require('../db/models');
const { jwtSecret } = require('../config/app');

const algorithm = 'aes-256-ecb';

exports.acl = role => {
  return (req, res, next) => {
    const roles = role instanceof String ? Array.of(role) : role;
    if (!roles.includes(req.decoded.role)) {
      return this.handleError(res, this.buildErrObject(401, 'UNAUTHORIZED'));
    }
    next();
  };
};

exports.removeExtensionFromFile = file => {
  return file
    .split('.')
    .slice(0, -1)
    .join('.')
    .toString();
};

exports.getIP = req => requestIp.getClientIp(req);

exports.getBrowserInfo = req => req.headers['user-agent'];

exports.getCountry = req =>
  req.headers['cf-ipcountry'] ? req.headers['cf-ipcountry'] : 'XX';

exports.emailExists = async email => {
  return new Promise((resolve, reject) => {
    User.findOne({
      where: {
        email
      }
    })
      .then(result => {
        if (result) {
          reject(this.buildErrObject(422, 'EMAIL_ALREADY_EXISTS'));
        }
        resolve(false);
      })
      .catch(err => {
        reject(this.buildErrObject(422, err.message));
      });
  });
};

exports.encrypt = text => {
  console.log(jwtSecret);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(jwtSecret), null);
  let crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  return crypted;
};

exports.decrypt = text => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(jwtSecret),
    null
  );
  try {
    let dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  } catch (err) {
    return err;
  }
};

exports.handleError = (res, err) => {
  // Prints error in console
  if (process.env.NODE_ENV === 'development') {
    console.log(err);
  }
  // Sends error to user
  res.status(err.code).json({
    errors: {
      code: err.code,
      message: err.message,
      data: err.data
    }
  });
};

exports.buildErrObject = (code, message, data = undefined) => {
  return { code, message, data };
};

exports.buildSuccObject = msg => {
  return {
    msg
  };
};