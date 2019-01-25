import { config } from "dotenv-safe";
import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import passport from "passport";

// import routes from './app/routes';
import routes from "./routes";
import database from "./config/database";

// DotEnv
config();

const app = express();

app.set("port", process.env.PORT || 3000);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(
  bodyParser.json({
    limit: "20mb"
  })
);
app.use(
  bodyParser.urlencoded({
    limit: "20mb",
    extended: true
  })
); /* for parsing application/x-www-form-urlencoded ~*/
app.use(cors());
app.use(passport.initialize());
app.use(compression());
app.use(helmet());
// Redis cache enabled only for production
if (process.env.NODE_ENV === "production") {
  // app.use(cache);
}
app.use(express.static("public"));
app.use(routes);

// Place.belongsTo(User, { constraints: true, onDelete: 'CASCADE'});
// User.hasMany(Product);

database
  .sync()
  .then(result => {
    // console.log(result);
    app.listen(app.get("port"));
  })
  .catch(err => {
    console.log(err);
  });

export default app; // for testing
