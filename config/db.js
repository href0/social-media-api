const dotenv = require("dotenv");
dotenv.config();
// const { Sequelize } = require("sequelize");

// const db = new Sequelize("auth", "root", "", {
//   host: "localhost",
//   dialect: "mysql",
//   timezone: "+07:00",
// });

const { Sequelize } = require("sequelize");

const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    timezone: "+07:00",
  }
);
module.exports = db;

// pass DB Cpanel niagahoster = Ef]X+KY}U]Ch

// const { Sequelize } = require("sequelize");

// const db = new Sequelize(
//   "heroku_d867145d301a970",
//   "b9a2f057d1b68a",
//   "1508f860",
//   {
//     host: "us-cdbr-east-05.cleardb.net",
//     dialect: "mysql",
//     timezone: "+07:00",
//   }
// );

// module.exports = db;
// const { Sequelize } = require("sequelize");

// const db = new Sequelize("auth", "root", "Jarumcoklat.123", {
//   host: "localhost",
//   dialect: "mysql",
//   timezone: "+07:00",
// });

// module.exports = db;
