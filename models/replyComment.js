const { Sequelize } = require("sequelize");
const db = require("../config/db.js");

const { DataTypes } = Sequelize;

const replyComment = db.define(
  "replyComments",
  {
    replyComment: {
      type: DataTypes.STRING,
    },
  },
  {
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
  },
  {
    freezeTableName: true,
  }
);

module.exports = replyComment;
