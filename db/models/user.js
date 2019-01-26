"use strict";

const bcrypt = require("bcrypt-nodejs");
const uuid = require("uuid/v1");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      username: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      thumbnail: DataTypes.STRING,
      info: DataTypes.JSON,
      role: DataTypes.STRING,
      verification: DataTypes.STRING,
      verified: DataTypes.BOOLEAN,
      authorized: DataTypes.BOOLEAN,
      blockExpires: DataTypes.DATE,
      loginAttempts: DataTypes.INTEGER,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    },
    {
      hooks: {
        beforeCreate: async user => {
          user.id = uuid();
          await bcrypt.genSalt(5, function(err, salt) {
            bcrypt.hash(user.password, salt, null, function(err, hash) {
              user.password = hash;
              // Promise.resolve(user);
            });
          });
        }
      }
    }
  );

  User.prototype.comparePassword = function(passwordAttempt, cb) {
    bcrypt.compare(passwordAttempt, this.password, (err, isMatch) =>
      err ? cb(err) : cb(null, isMatch)
    );
  };

  User.prototype.toJSON = function() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      thumbnail: this.thumbnail,
      info: this.info,
      role: this.role
    };
  };

  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};