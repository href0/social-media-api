const { Sequelize } = require("sequelize");
const db = require("../config/db.js");

const postLikes = db.define(
  "postLikes",
  {},
  {
    freezeTableName: true,
  }
);

module.exports = postLikes;
