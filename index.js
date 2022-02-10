const express = require("express");
//CONFIG
const db = require("./config/db.js");
// const uploadImage = require("./config/UploadImage.js");

const router = require("./routes/index.js");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
// const multer = require("multer");

//MODEL
const Users = require("./models/UserModel.js");
const Otp = require("./models/OtpModel.js");
const Follows = require("./models/FollowModel.js");
const Posts = require("./models/PostModel");

const cors = require("cors");
const http = require("http");
const { json } = require("body-parser");

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
    await Posts.sync();
  } catch (error) {
    console.error("Database Error: " + error);
  }
};
koneksi();
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
// app.use(
//   multer({
//     storage: uploadImage.fileStorage,
//     fileFilter: uploadImage.fileFilter,
//   }).single("image")
// );
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api", router);

app.listen(port, () => console.log("server running at port 8800"));
