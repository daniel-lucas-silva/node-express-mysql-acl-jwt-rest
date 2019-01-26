var router = require("express").Router();
var acl = require("express-acl");

acl.config({
  filename: "acl.json",
  path: "config",
  baseUrl: "/api"
});

router.use(require("./middlewares/jwtMiddleware"));

router.use(acl.authorize);

router.use("/api", require("./controllers"));

module.exports = router;
