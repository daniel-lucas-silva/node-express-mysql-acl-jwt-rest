"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      "UserAccess",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        email: {
          type: Sequelize.STRING
        },
        ip: {
          type: Sequelize.STRING
        },
        browser: {
          type: Sequelize.TEXT
        },
        date: {
          type: Sequelize.DATEONLY
        }
      },
      {
        timestamps: false
      }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("UserAccess");
  }
};
