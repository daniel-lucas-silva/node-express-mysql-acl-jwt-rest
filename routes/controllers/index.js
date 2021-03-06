const router = require('express').Router();

router.use('/users', require('./usersController'));
router.use('/auth', require('./authController'));
router.use('/posts', require('./postsController'));
router.use('/categories', require('./categoriesController'));

router.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce((errors, key) => {
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }

  return next(err);
});

module.exports = router;
