import { Sequelize } from "sequelize";

const db = new Sequelize("auth", "root", "", {
  host: "localhost",
  dialect: "mysql",
  timezone: "+07:00",
});

export default db;
