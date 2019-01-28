'use strict';

module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    'Category',
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      thumbnail: DataTypes.STRING
    },
    {}
  );
  Category.associate = function(models) {
    Category.hasMany(models.Post);
  };
  return Category;
};