import express from "express";
import db from "./config/db.js";
import router from "./routes/index.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import Users from "./models/UserModel.js";
import Otp from "./models/OtpModel.js";
import Follows from "./models/FollowModel.js";
import cors from "cors";
import http from "http";

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
