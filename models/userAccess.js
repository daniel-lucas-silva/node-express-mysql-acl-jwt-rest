import uuid from "uuid/v4";
import Sequelize from "sequelize";
import database from "../config/database";

const UserAccess = database.define(
  "user_access",
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true
    },
    email: {
      type: Sequelize.STRING({ length: 150 }),
      allowNull: false,
      validate: {
        isEmail: true
      }
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
    tableName: "user_access",
    timestamps: false
  }
);

export default UserAccess;
