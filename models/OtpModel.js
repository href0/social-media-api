import { Sequelize } from "sequelize";
import db from "../config/db.js";

const { DataTypes } = Sequelize;

const Otp = db.define(
  "otp",
  {
    phone_number: {
      type: DataTypes.STRING,
    },
    code: {
      type: DataTypes.STRING,
    },
    expired: {
      type: DataTypes.STRING,
    },
    register_token: {
      type: DataTypes.TEXT,
    },
  },
  {
    freezeTableName: true,
  }
);

export default Otp;
