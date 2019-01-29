'use strict';

const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define(
    'Post',
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
      content: {
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
      },
      userId: DataTypes.UUIDV1,
      categoryId: DataTypes.INTEGER
    },
    {}
  );
  Post.associate = function(models) {
    Post.belongsTo(models.User);
  };

  sequelizePaginate.paginate(Post);

  return Post;
};
