import User from "../models/user";
const passport = require("passport");
const { decrypt } = require("../functions/base");
const JwtStrategy = require("passport-jwt").Strategy;

const jwtExtractor = req => {
  let token = null;
  if (req.headers.authorization) {
    token = req.headers.authorization.replace("Bearer ", "").replace(" ", "");
  } else if (req.body.token) {
    token = req.body.token.replace(" ", "");
  } else if (req.query.token) {
    token = req.query.token.replace(" ", "");
  }
  // if (token) {
  //   token = decrypt(token);
  // }
  return token;
};

const jwtOptions = {
  jwtFromRequest: jwtExtractor,
  secretOrKey: "MyUltraSecurePassWordIWontForgetToChange"
};

const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  User.findById(payload.id)
    .then(result => {
      return !result ? done(null, false) : done(null, result);
    })
    .catch(err => {
      return done(null, false);
    });
});

passport.use(jwtLogin);
