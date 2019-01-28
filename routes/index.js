const router = require('express').Router();

router.use(require('./middlewares/jwtMiddleware'));

router.use('/api', require('./controllers'));

module.exports = router;
