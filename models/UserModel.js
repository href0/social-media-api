const { Sequelize } = require("sequelize");
const db = require("../config/db.js");

const { DataTypes } = Sequelize;

const Users = db.define(
  "users",
  {
    level_id: {
      type: DataTypes.INTEGER,
    },
    phone_number: {
      type: DataTypes.STRING,
      unique: { msg: "No handphone sudah terdaftar" },
    },
    username: {
      type: DataTypes.STRING,
      unique: { msg: "Username sudah terdaftar" },
    },
    provider: {
      type: DataTypes.ENUM("phone", "google", "facebook", "tiktok"),
    },
    uid: {
      type: DataTypes.STRING,
      unique: { msg: "Uid sudah terdaftar" },
    },
    id_card: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      unique: { msg: "Email sudah terdaftar" },
      // validate: {
      //   isEmail: { msg: "Format email salah" },
      // },
    },
    full_name: {
      type: DataTypes.STRING,
    },
    gender: {
      type: DataTypes.STRING,
    },
    bio: {
      type: DataTypes.TEXT,
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      validate: { isDate: { msg: "Format tanggal salah (yyyy-mm-dd)" } },
    },
    name_card: {
      type: DataTypes.STRING,
    },
    type_card: {
      type: DataTypes.STRING,
    },
    picture_card: {
      type: DataTypes.STRING,
    },
    profile_picture: {
      type: DataTypes.STRING,
    },
    brand_name: {
      type: DataTypes.STRING,
    },
    brand_domain: {
      type: DataTypes.STRING,
    },
    brand_image: {
      type: DataTypes.STRING,
    },
    is_active_brand: {
      type: DataTypes.ENUM("0", "1"),
      defaultValue: "0",
    },
    refresh_token: {
      type: DataTypes.TEXT,
    },
  },
  { freezeTableName: true }
);

module.exports = Users;
