const Users = require("../models/UserModel.js");
const Otp = require("../models/OtpModel.js");
const formatter = require("../helper/formatter.js");

// VerifyOTP
const verifyOtp = async (req, res, next) => {
  try {
    let noHpFormatted;
    if (req.body.phone_number) {
      noHpFormatted = formatter.phoneNumberFormatter(req.body.phone_number);
    } else if (req.body.email) {
      noHpFormatted = req.body.email;
    }
    // const nohp = req.body.phone_number;
    const code = req.body.code;
    const otp = await Otp.findOne({
      limit: 1,
      where: {
        phone_number: noHpFormatted,
      },
      order: [["expired", "DESC"]],
    });
    if (!otp)
      return res
        .status(403)
        .json({ status: "Error", message: "Terjadi kesalahan" });
    if (otp.code != code)
      return res
        .status(406)
        .json({ status: "Error", message: "Kode tidak valid" });
    if (otp.expired < Date.now())
      return res
        .status(406)
        .json({ status: "Error", message: "Kode tidak valid" });

    const user = await Users.findOne({
      where: {
        phone_number: otp.phone_number,
      },
    });
    req.phone_number = otp.phone_number;
    req.code = otp.code;
    next();
  } catch (error) {
    res.status(500).json({ status: "Error", message: "Terjadi kesalahan" });
  }
};

module.exports = { verifyOtp };
