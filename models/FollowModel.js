const { Sequelize } = require("sequelize");
const db = require("../config/db.js");

const { DataTypes } = Sequelize;

const Follows = db.define(
  "follows",
  {},
  {
    freezeTableName: true,
  }
);

module.exports = Follows;
