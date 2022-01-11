const { Sequelize } = require("sequelize");
const db = require("../config/db.js");

const { DataTypes } = Sequelize;

const Follows = db.define(
  "follows",
  {
    sender_id: {
      type: DataTypes.INTEGER,
    },
    receiver_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    freezeTableName: true,
  }
);

module.exports = Follows;
