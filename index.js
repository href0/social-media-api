const express = require("express");
const db = require("./config/db.js");
const router = require("./routes/index.js");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const Users = require("./models/UserModel.js");
const Otp = require("./models/OtpModel.js");
const Follows = require("./models/FollowModel.js");
const cors = require("cors");
const http = require("http");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 8800;
dotenv.config();

const koneksi = async () => {
  try {
    await db.authenticate();
    console.log("Database connected!");
    await Users.sync();
    await Otp.sync();
    await Follows.sync();
  } catch (error) {
    console.error("Database Error: " + error);
  }
};
koneksi();
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

app.use(cookieParser());
app.use(express.json());
app.use("/api", router);

app.listen(port, () => console.log("server running at port 8800"));
