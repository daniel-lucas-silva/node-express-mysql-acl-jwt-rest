const jwt = require('jsonwebtoken');
const app = require('../../config/app.json');
const router = require('express').Router();
const { decrypt, handleError } = require('../../core/base');
const { User } = require('../../db/models');

router.use((req, res, next) => {
  let token = req.headers.authorization;
  token = token && token.replace('Bearer ', '').replace(' ', '');

  if (!token) {
    req.decoded = { role: 'guest' };
    return next();
  }

  return jwt.verify(decrypt(token), app.jwtSecret, async (err, decoded) => {
    if (err) {
      return handleError(res, { code: 401, message: 'BAD_TOKEN_GET_A_NEW_ONE' });
    }

    return await User.findById(decoded.id)
      .then(result => {
        if(!result) {
          throw { code: 404, message: 'USER_NOT_EXIST' }
        }
        const { id, role } = result;
        return req.decoded = { id, role };
      })
      .then(() => {
        next();
      })
      .catch(err=> {
        handleError(res, err)
      }); 
  });
});

module.exports = router;
