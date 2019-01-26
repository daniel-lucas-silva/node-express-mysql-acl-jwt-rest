const router = require('express').Router();
const { handleError } = require('../../core/base');
const {
  userExists,
  findUser,
  userIsBlocked,
  checkLoginAttemptsAndBlockExpires,
  checkPassword,
  passwordsDoNotMatch,
  saveLoginAttemptsToDB,
  saveUserAccessAndReturnToken,
  registerUser,
  setUserInfo,
  returnRegisterToken,
  // sendRegistrationEmailMessage,
  verificationExists,
  verifyUser,
  saveForgotPassword,
  sendResetPasswordEmailMessage,
  forgotPasswordResponse,
  findForgotPassword,
  findUserToResetPassword,
  updatePassword,
  markResetPasswordAsUsed
} = require('../../core/users');

router
  /**
   * Auth current user
   */
  .get('/', (req, res, next) => {
    res.send({ me: 'me' });
  })
  /**
   * Login
   */
  .post('/login', async (req, res) => {
    try {
      const { identity, password } = req.body;
      const user = await findUser(identity);
      await userIsBlocked(user);
      await checkLoginAttemptsAndBlockExpires(user);
      const isPasswordMatch = await checkPassword(password, user);
      if (!isPasswordMatch) {
        handleError(res, await passwordsDoNotMatch(user));
      } else {
        // all ok, register access and return token
        user.loginAttempts = 0;
        await saveLoginAttemptsToDB(user);
        res.status(200).json(await saveUserAccessAndReturnToken(req, user));
      }
    } catch (error) {
      handleError(res, error);
    }
  })
  /**
   * Register
   */
  .post('/register', async (req, res) => {
    try {
      const { email, username } = req.body;
      const doesUserExists = await userExists(email, username);
      if (!doesUserExists) {
        const item = await registerUser(req);
        const userInfo = setUserInfo(item);
        const response = returnRegisterToken(item, userInfo);
        // sendRegistrationEmailMessage(item);
        res.status(201).json(response);
      }
    } catch (error) {
      handleError(res, error);
    }
  })
  /**
   * Verify
   */
  .post('/verify', async (req, res) => {
    try {
      const user = await verificationExists(req.body.id);
      res.status(200).json(await verifyUser(user));
    } catch (error) {
      handleError(res, error);
    }
  })
  /**
   * Forgot password
   */
  .post('/forgot', async (req, res) => {
    try {
      await findUser(req.body.email);
      const item = await saveForgotPassword(req);
      sendResetPasswordEmailMessage(item);
      res.status(200).json(forgotPasswordResponse(item));
    } catch (error) {
      handleError(res, error);
    }
  })
  /**
   * Reset password
   */
  .post('/reset', async (req, res) => {
    try {
      const forgotPassword = await findForgotPassword(req.body.id);
      const user = await findUserToResetPassword(forgotPassword.email);
      await updatePassword(data.password, user);
      const result = await markResetPasswordAsUsed(req, forgotPassword);
      res.status(200).json(result);
    } catch (error) {
      handleError(res, error);
    }
  });

module.exports = router;
