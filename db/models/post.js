'use strict';

module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define(
    'Post',
    {
      title: DataTypes.STRING,
      content: DataTypes.TEXT,
      thumbnail: DataTypes.STRING,
      userId: DataTypes.UUIDV1,
      categoryId: DataTypes.INTEGER
    },
    {}
  );
  Post.associate = function(models) {
    Post.belongsTo(models.User);
  };
  return Post;
};
