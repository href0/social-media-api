const { Sequelize } = require("sequelize");

const db = new Sequelize("auth", "root", "", {
  host: "localhost",
  dialect: "mysql",
  timezone: "+07:00",
});

module.exports = db;
// const { Sequelize } = require("sequelize");

// const db = new Sequelize(
//   "u1748447_karkoon",
//   "u1748447_karkoon",
//   "Ef]X+KY}U]Ch",
//   {
//     host: "localhost",
//     dialect: "mysql",
//     timezone: "+07:00",
//   }
// );

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
