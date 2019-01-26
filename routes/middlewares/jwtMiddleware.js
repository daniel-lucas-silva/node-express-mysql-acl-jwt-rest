const jwt = require('jsonwebtoken');
const app = require('../../config/app.json');
const router = require('express').Router();

router.use((req, res, next) => {
  let token = req.headers.authorization;
  token = token && token.replace('Bearer ', '').replace(' ', '');

  if (!token) {
    req.decoded = { role: 'guest' };
    return next();
  }

  return jwt.verify(token, app.jwtSecret, (err, decoded) => {
    if (err) {
      return res.send(err);
    }

    req.decoded = decoded;
    return next();
  });
});

module.exports = router;
