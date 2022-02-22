const { Sequelize } = require("sequelize");
const db = require("../config/db.js");

const { DataTypes } = Sequelize;

const replyCommentLike = db.define(
  "replyCommentLikes",
  {},
  {
    freezeTableName: true,
  }
);

module.exports = replyCommentLike;
