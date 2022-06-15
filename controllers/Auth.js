const Users = require("../models/UserModel.js");
const Otp = require("../models/OtpModel.js");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { validationResult } = require("express-validator");
const formatter = require("../helper/formatter.js");
const generateToken = require("../helper/GenerateToken.js");
const dotenv = require("dotenv");
const Follows = require("../models/FollowModel.js");
dotenv.config();
const { Op } = require("sequelize");

/*LOGIN REGISTER WITH PHONE NUMBER AND OTP*/

// SendOTP
const sendOTP = async (req, res) => {
  // const refreshToken = req.cookies.refreshToken;
  // if (refreshToken)
  //   return res.status(400).json({
  //     error: true,
  //     message: "Status masih login, silahkan logout terlebih dahulu",
  //   });
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ error: true, message: errors["errors"][0].msg });
  }

  try {
    const code = Math.floor(100000 + Math.random() * 900000);
    const expired = Date.now() + 2 * 60 * 1000; // 2menit
    const phoneNumber = formatter.phoneNumberFormatter(req.body.phone_number);
    await Otp.create({
      phone_number: phoneNumber,
      code: code,
      expired: expired,
    });

    let config = {
      method: "post",
      url: "https://sendtalk-api.taptalk.io/api/v1/message/send_whatsapp",
      headers: {
        "api-key": process.env.SENDTALK_API_KEY,
        "Content-Type": "application/json",
      },
      data: {
        phone: phoneNumber,
        messageType: "otp",
        body: `*${
          process.env.COMPANY
        }* - JANGAN MEMBERITAHUKAN KODE INI KEPADA SIAPAPUN. KODE ANDA : ${String(
          code
        )}`,
      },
    };

    // SEND OTP CODE TO WHATSAPP USER
    await axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        res.status(200).json({
          error: false,
          message: "Kode OTP berhasil dikirim",
        });
      })
      .catch(function (error) {
        console.log(error);
        res.status(400).json({
          error: true,
          message: error,
        });
      });
  } catch (error) {
    console.error("Auth error : " + error);
    res.status(500).json(error);
  }
};

//LOGIN
const Login = async (req, res) => {
  try {
    const nohp = req.phone_number;
    const code = req.code;
    const user = await Users.findOne({
      attributes: {
        exclude: ["refresh_token"],
      },
      where: {
        phone_number: nohp,
      },
    });
    if (!user) {
      const registerToken = jwt.sign(
        { phoneNumber: nohp, code: code },
        process.env.REGISTER_TOKEN_SECRET,
        { expiresIn: "10m" }
      );
      await Otp.update(
        { register_token: registerToken },
        {
          where: {
            phone_number: nohp,
            code: code,
          },
        }
      );
      res.status(200).json({
        error: false,
        message: { register: true, register_token: registerToken },
      });
    } else {
      const following = await Follows.findAll({
        where: {
          sender_id: user.id,
        },
        attributes: [["receiver_id", "userId"]],
      });

      const followers = await Follows.findAll({
        where: {
          receiver_id: user.id,
        },
        attributes: [["sender_id", "userId"]],
      });

      const userWithFollow = {
        ...user._previousDataValues,
        following,
        followers,
      };

      const userId = user.id;
      const levelId = user.level_id;
      const name = user.username;
      const full_name = user.full_name;
      const email = user.email;
      const phone_number = user.phone_number;
      const provider = "phone";

      const getToken = await generateToken.generateToken(
        userId,
        levelId,
        name,
        phone_number,
        email,
        full_name,
        provider
      );

      if (getToken) {
        res.cookie("refreshToken", getToken.refreshToken, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 90 * 1000, // gunakan secure : true untuk https
        });
      }
      // delete code otp dari database
      await Otp.destroy({ where: { phone_number: user.phone_number } });

      res.json({
        error: false,
        message: {
          register: false,
          user: userWithFollow,
          refreshToken: getToken.refreshToken,
          accessToken: getToken.accessToken,
        },
      });
    }
  } catch (error) {
    res.status(500).json("Login error: " + error);
  }
};

// REGISTER
const Register = async (req, res) => {
  const format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  if (!req.body.username || req.body.username == "")
    return res
      .status(400)
      .json({ error: true, message: "Username tidak boleh kosong" });
  if (format.test(req.body.username))
    return res
      .status(400)
      .json({ error: true, message: "Hanya boleh huruf dan angka" });

  try {
    const checkUser = await Users.findOne({
      where: {
        [Op.or]: [
          { username: req.body.username },
          {
            phone_number: req.phoneNumber,
          },
        ],
      },
    });

    if (checkUser) {
      if (checkUser.username == req.body.username) {
        return res
          .status(400)
          .json({ error: true, message: "Username sudah terdaftar" });
      } else if (checkUser.phone_number == req.phoneNumber) {
        return res
          .status(400)
          .json({ error: true, message: "No handphone sudah terdaftar" });
      }
    }
    const create = await Users.create({
      phone_number: req.phoneNumber, // dari middleware register
      username: req.body.username,
      full_name: req.body.username,
      birth_date: req.body.birth_date,
      bio: "",
      uid: req.body.uid,
      id_card: "",
      gender: "",
      name_card: "",
      type_card: "",
      picture_card: "",
      brand_name: "",
      brand_domain: "",
      brand_image: "",
      profile_picture: "",
      is_active_brand: "0",
      email: req.body.email,
      provider: "phone",
      level_id: "4", // 1. Superadmin 2.Admin 3.Brand 4.userBiasa
    });
    const userId = create.id;
    const name = create.username;
    const full_name = create.full_name;
    const email = create.email ?? null;
    const levelId = create.level_id;
    const phone_number = create.phone_number;
    const provider = "phone";
    const following = [];
    const followers = [];

    const getToken = await generateToken.generateToken(
      userId,
      levelId,
      name,
      phone_number,
      email,
      full_name,
      provider
    );

    if (getToken) {
      res.cookie("refreshToken", getToken.refreshToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // gunakan secure : true untuk https
      });
    } else {
      return res
        .status(400)
        .json({ error: true, message: "Terjadi kesalahan" });
    }

    await Otp.destroy({ where: { phone_number: req.body.phoneNumber } });
    const userWithFollow = {
      ...create._previousDataValues,
      following,
      followers,
    };
    res.status(201).json({
      error: false,
      message: {
        user: userWithFollow,
        refreshToken: getToken.refreshToken,
        accessToken: getToken.accessToken,
      },
    });
  } catch (error) {
    res.status(403).json({
      error: true,
      message: error.errors,
    });
  }
};

// CHECK USERNAME
const checkUsername = async (req, res) => {
  try {
    const checkUser = await Users.findOne({
      where: { username: req.body.username },
    });
    if (checkUser) {
      return res
        .status(401)
        .json({ error: true, message: "Username sudah terpakai" });
    } else {
      return res
        .status(200)
        .json({ error: false, message: "Username bisa dipakai" });
    }
  } catch (error) {
    return res.status(401).json({ error });
  }
};

/*END OF LOGIN REGISTER WITH PHONE NUMBER AND OTP*/

/* SOCIAL LOGIN ( GOOGLE, FACEBOOK, TIKTOK )*/

const LoginSocial = async (req, res) => {
  // return console.log(email);
  try {
    const emailMiddleware = req.email;
    const uidMiddleware = req.uid;
    const fullNameMiddleware = req.name;
    const providerMiddleware = req.provider;
    const user = await Users.findOne({
      where: {
        email: emailMiddleware,
      },
    });
    if (!user) {
      const username = emailMiddleware.split("@");
      const create = await Users.create({
        email: emailMiddleware,
        provider: providerMiddleware,
        username: username[0] + Math.floor(Math.random() * 100 + 1),
        full_name: fullNameMiddleware,
        uid: uidMiddleware,
        level_id: "4", // 1. Superadmin 2.Admin 3.Brand 4.userBiasa
      });

      const userId = create.id;
      const levelId = create.level_id;
      const name = create.username;
      const full_name = create.full_name;
      const email = create.email;
      const phone_number = null;
      const provider = providerMiddleware;

      const getToken = await generateToken.generateToken(
        userId,
        levelId,
        name,
        phone_number,
        email,
        full_name,
        provider
      );

      if (getToken) {
        res.cookie("refreshToken", getToken.refreshToken, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000, // gunakan secure : true untuk https
        });
      }

      res.status(200).json({
        error: false,
        message: "Register berhasil",
        accessToken: getToken.accessToken,
      });
    } else {
      // check provider yang login apakah sama, jika tidak sama maka email sudah terdaftar tapi berdeda provider
      if (user.provider != providerMiddleware) {
        if (user.provider == "facebook") {
          return res.status(400).json({
            error: true,
            type: "login_error",
            message:
              "Email telah terdaftar menggunakan facebook, silahkan login menggunakan facebook",
          });
        } else if (user.provider == "google") {
          return res.status(400).json({
            error: true,
            type: "login_error",
            message:
              "Email telah terdaftar menggunakan google, silahkan login menggunakan google",
          });
        } else if (user.provider == "tiktok") {
          return res.status(400).json({
            error: true,
            type: "login_error",
            message:
              "Email telah terdaftar menggunakan tiktok, silahkan login menggunakan tiktok",
          });
        } else if (user.provider == "phone") {
          return res.status(400).json({
            error: true,
            type: "login_error",
            message:
              "Email telah terdaftar menggunakan no handphone, silahkan login pakai no handphone",
          });
        }
      }

      // memastikan uid dari client sama dengann uid yang didatabase
      if (user.uid != uidMiddleware) {
        return res.status(401).json({
          error: true,
          message: "Uid tidak cocok dengan database",
        });
      }

      // data JWT
      const userId = user.id;
      const levelId = user.level_id;
      const name = user.username;
      const full_name = user.full_name;
      const phone_number = user.phone_number;
      const email = user.email;
      const provider = providerMiddleware;

      const getToken = await generateToken.generateToken(
        userId,
        levelId,
        name,
        phone_number,
        email,
        full_name,
        provider
      );

      if (getToken) {
        res.cookie("refreshToken", getToken.refreshToken, {
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000, // gunakan secure : true untuk https
        });
      }

      res.json({
        error: false,
        register: false,
        accessToken: getToken.accessToken,
      });
    }
  } catch (error) {
    res.status(500).json("Login error: " + error);
  }
};

/* END OF SOCIAL LOGIN*/

// LOGOUT
const Logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204); // no content
  const user = await Users.findOne({
    where: {
      refresh_token: refreshToken,
    },
  });
  if (!user) return res.sendStatus(204); // no content
  const userId = user.id;
  await Users.update(
    { refresh_token: null },
    {
      where: {
        id: userId,
      },
    }
  );
  res.clearCookie("refreshToken");
  return res.status(200).json({ error: false, message: "Berhasil logout" });
};

module.exports = {
  sendOTP,
  Login,
  Register,
  Logout,
  LoginSocial,
  checkUsername,
};
