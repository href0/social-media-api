import Otp from "../models/OtpModel.js";
import jwt from "jsonwebtoken";

export const RegisterMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"]; // mengambil header
  const token = authHeader && authHeader.split(" ")[1]; // mengambil token, jika tidak ada header makan null
  if (token == null) return res.sendStatus(401); // jika token null status Unauthorized
  const otp = await Otp.findOne({
    // cek apakah token_register ditable OTP sama dengan token yang dikirim dari header
    where: { register_token: token },
  });
  if (!otp) return res.sendStatus(404); // jika tidak sama, error

  // jika token sama, maka verify tokennya
  jwt.verify(token, process.env.REGISTER_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403); // Forbidden

    //ambil no handphone dan kirim untuk dipakai diregister
    req.phoneNumber = decoded.phoneNumber;
    next(); // next ke register
  });
};
