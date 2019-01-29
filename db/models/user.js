'use strict';

const bcrypt = require('bcrypt-nodejs');
const uuid = require('uuid/v1');
const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Required field!'
          }
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: {
            msg: 'Valid email required!'
          },
          notEmpty: {
            msg: 'Required field!'
          }
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Required field!'
          }
        }
      },
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
          await bcrypt.genSalt(5, (err, salt) => {
            bcrypt.hash(user.password, salt, null, (err, hash) => {
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
    User.hasMany(models.Post);
  };

  sequelizePaginate.paginate(User);

  return User;
};
