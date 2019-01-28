const jwt = require('jsonwebtoken');
const app = require('../../config/app.json');
const router = require('express').Router();
const { decrypt } = require('../../core/base');
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
      return res.send(err);
    }

    await User.findById(decoded.id).then(result => {
      const { role } = result;
      req.decoded = { role };
    });

    return next();
  });
});

module.exports = router;
