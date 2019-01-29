'use strict';

const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    'Category',
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Required field!'
          }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Required field!'
          }
        }
      },
      thumbnail: {
        type: DataTypes.STRING,
        validate: {
          isUrl: true
        }
      }
    },
    {}
  );
  Category.associate = function(models) {
    Category.hasMany(models.Post);
  };

  sequelizePaginate.paginate(Category);

  return Category;
};
