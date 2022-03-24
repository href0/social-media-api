const { Sequelize } = require("sequelize");
const db = require("../config/db.js");

const { DataTypes } = Sequelize;

const Post = db.define(
  "posts",
  {
    // user_id: {
    //   type: DataTypes.INTEGER,
    // },
    title_post: {
      type: DataTypes.STRING,
    },
    desc_post: {
      type: DataTypes.TEXT,
    },
    image_post: {
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

module.exports = Post;
