import auth from "../auth";
import passport from "passport";
import "../../config/passport";
import User from "../../models/user";
import * as userFn from "../../functions/userFunctions";
import * as baseFn from "../../functions/base";

const requireAuth = passport.authenticate("jwt", {
  session: false
});

var router = require("express").Router();

router.get(
  "/user/:id",
  requireAuth,
  auth(["user", "admin"]),
  (req, res, next) => {
    User.findById(req.params.id)
      .then(function(user) {
        if (!user) {
          return res.sendStatus(404);
        }

        return res.json({ user: user.toJSON() });
      })
      .catch(next);
  }
);

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userFn.findUser(email);
    await userFn.userIsBlocked(user);
    await userFn.checkLoginAttemptsAndBlockExpires(user);
    const isPasswordMatch = await userFn.checkPassword(password, user);
    if (!isPasswordMatch) {
      baseFn.handleError(res, await userFn.passwordsDoNotMatch(user));
    } else {
      // all ok, register access and return token
      user.loginAttempts = 0;
      await userFn.saveLoginAttemptsToDB(user);
      return res
        .status(200)
        .json(await userFn.saveUserAccessAndReturnToken(req, user));
    }
    // return res.json({ user });
  } catch (error) {
    baseFn.handleError(res, error);
  }
});

router.post("/register", async (req, res, next) => {
  try {
    const { email } = req.body;
    const doesEmailExists = await baseFn.emailExists(email);
    if (!doesEmailExists) {
      const item = await userFn.registerUser(req);
      const userInfo = userFn.setUserInfo(item);
      const response = userFn.returnRegisterToken(item, userInfo);
      // userFn.sendRegistrationEmailMessage(item);
      console.log("aqui");
      res.status(201).json(response);
    }
  } catch (error) {
    baseFn.handleError(res, error);
  }
});

router.post("/create", requireAuth, auth(["admin"]), function(req, res, next) {
  const { name, username, email, password } = req.body;

  return User.create({
    name,
    username,
    email,
    password,
    role: "user"
  })
    .then(result => {
      return res.json({ user: result });
    })
    .catch(next);
});

module.exports = router;
