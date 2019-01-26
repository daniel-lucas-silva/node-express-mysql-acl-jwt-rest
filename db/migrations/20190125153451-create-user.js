"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV1,
        unique: true
      },
      username: { type: Sequelize.STRING({ length: 100 }), unique: true },
      email: {
        type: Sequelize.STRING({
          length: 150
        }),
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
      },
      password: { type: Sequelize.CHAR({ length: 60 }), allowNull: false },
      thumbnail: {
        type: Sequelize.STRING({
          length: 150
        }),
        validate: { isUrl: true }
      },
      info: { type: Sequelize.JSON },
      role: { allowNull: false, type: Sequelize.STRING({ length: 15 }) },
      verification: { type: Sequelize.STRING },
      verified: { type: Sequelize.BOOLEAN, defaultValue: false },
      authorized: { type: Sequelize.BOOLEAN, defaultValue: true },
      blockExpires: { type: Sequelize.DATE },
      loginAttempts: { type: Sequelize.INTEGER },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: true, type: Sequelize.DATE }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Users");
  }
};
