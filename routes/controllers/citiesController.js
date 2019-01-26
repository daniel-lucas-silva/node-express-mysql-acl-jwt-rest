const router = require("express").Router();

router.get("/", (req, res, next) => {
  res.send("teste");
});

module.exports = router;
