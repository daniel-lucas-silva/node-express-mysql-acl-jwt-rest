"use strict";

const uuid = require("uuid/v1");
const { User } = require('../models');

module.exports = {
  up: (queryInterface, Sequelize) => {
   let users = [
    {
      id: uuid(),
      username: "admin",
      email: "admin@admin.com",
      password: "12345678",
      role: "admin",
      verified: true,
      authorized: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
   ];

   return User.bulkCreate(users, {
      validate:true,
      individualHooks: true
    })
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  }
};
