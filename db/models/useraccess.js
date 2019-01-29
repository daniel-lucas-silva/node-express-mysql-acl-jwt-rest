'use strict';

const sequelizePaginate = require('sequelize-paginate');

module.exports = (sequelize, DataTypes) => {
  const UserAccess = sequelize.define(
    'UserAccess',
    {
      email: DataTypes.STRING,
      ip: DataTypes.STRING,
      browser: DataTypes.STRING,
      date: DataTypes.DATEONLY
    },
    { freezeTableName: true, timestamps: false }
  );
  UserAccess.associate = function(models) {
    // associations can be defined here
  };

  sequelizePaginate.paginate(UserAccess);

  return UserAccess;
};
