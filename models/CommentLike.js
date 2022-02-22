const { Sequelize } = require("sequelize");
const db = require("../config/db.js");

const { DataTypes } = Sequelize;

const commentLike = db.define(
  "commentLikes",
  {},
  {
    freezeTableName: true,
  }
);

module.exports = commentLike;
