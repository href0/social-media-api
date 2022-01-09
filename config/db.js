import { Sequelize } from "sequelize";

// const db = new Sequelize("auth", "root", "", {
//   host: "localhost",
//   dialect: "mysql",
//   timezone: "+07:00",
// });

// export default db;

// import { Sequelize } from "sequelize";

const db = new Sequelize(
  "heroku_d867145d301a970",
  "b9a2f057d1b68a",
  "1508f860",
  {
    host: "us-cdbr-east-05.cleardb.net",
    dialect: "mysql",
    timezone: "+07:00",
  }
);

export default db;
