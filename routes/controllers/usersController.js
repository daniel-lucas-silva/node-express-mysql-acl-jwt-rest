const router = require("express").Router();
const base = require("../../core/base");
const users = require("../../core/users");

router
  .get("/", (req, res, next) => {
    User.findById(req.payload.id)
      .then(user => {
        if (!user) return res.sendStatus(401);

        return res.json({ user: user.toAuthJSON() });
      })
      .catch(next);
  })
  .post("/register", async (req, res, next) => {
    try {
      const { email } = req.body;
      const doesEmailExists = await base.emailExists(email);
      if (!doesEmailExists) {
        const item = await users.registerUser(req);
        const userInfo = users.setUserInfo(item);
        const response = users.returnRegisterToken(item, userInfo);
        // users.sendRegistrationEmailMessage(item);
        res.status(201).json(response);
      }
    } catch (error) {
      base.handleError(res, error);
    }
  })
  .get("/:id", (req, res, next) => {
    User.findById(req.payload.id)
      .then(user => {
        if (!user) return res.sendStatus(401);

        return res.json({ user: user.toAuthJSON() });
      })
      .catch(next);
  })
  .put("/:id", (req, res, next) => {})
  .delete("/:id", (req, res, next) => {});

module.exports = router;
