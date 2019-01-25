import uuid from "uuid/v4";
import Sequelize from "sequelize";
import database from "../config/database";
import bcrypt from "bcrypt-nodejs";
import {} from "../functions/base";

const User = database.define(
  "users",
  {
    id: {
      allowNull: false,
      primaryKey: true,
      type: Sequelize.UUID,
      defaultValue: uuid()
    },
    username: {
      type: Sequelize.STRING({ length: 100 }),
      allowNull: false
    },
    email: {
      type: Sequelize.STRING({ length: 150 }),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: Sequelize.CHAR({ length: 60 }),
      allowNull: false
    },
    thumbnail: {
      type: Sequelize.STRING({ length: 150 }),
      validate: {
        isUrl: true
      }
    },
    info: {
      type: Sequelize.JSON
    },
    role: {
      allowNull: false,
      type: Sequelize.STRING({ length: 15 })
    },
    verified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    authorized: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    blockExpires: {
      type: Sequelize.DATE
    },
    loginAttempts: {
      type: Sequelize.INTEGER
    }
  },
  {
    freezeTableName: true,

    hooks: {
      beforeCreate: async user => {
        const SALT_FACTOR = 5;
        // user.password = "teste";
        await bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
          bcrypt.hash(user.password, salt, null, function(err, hash) {
            user.password = hash;
            Promise.resolve(user);
          });
        });
        // const salt = bcrypt.genSalt(SALT_FACTOR);
        // const hash = bcrypt.hash(user.password, salt);
        // console.log("hash", hash);
      }
    }
  }
);

User.prototype.comparePassword = function(passwordAttempt, cb) {
  bcrypt.compare(passwordAttempt, this.password, (err, isMatch) =>
    err ? cb(err) : cb(null, isMatch)
  );
};

export default User;
