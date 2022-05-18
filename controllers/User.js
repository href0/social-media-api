const Users = require("../models/UserModel.js");
const Follows = require("../models/FollowModel.js");
const { Op, where } = require("sequelize");
const formatter = require("../helper/formatter.js");
const Otp = require("../models/OtpModel.js");
const axios = require("axios");
const dotenv = require("dotenv");

// GET ALL USERS
const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: ["id", "username", "phone_number"],
    });
    res.status(200).json({
      error: false,
      message: users,
    });
  } catch (error) {
    console.error("getUserError: " + error);
    return res.status(500).json({ error: true, message: error.message });
  }
};

// GET USER
const getUser = async (req, res) => {
  try {
    const user = await Users.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!user) {
      return res
        .status(404)
        .json({ error: true, message: "User tidak ditemukan" });
    }
    res.status(200).json({ error: false, message: user });
  } catch (error) {
    console.error("getUserError: " + error);
    res.status(400).json({ error: true, message: error });
  }
};

// UPDATE USER
const updateUser = async (req, res) => {
  // cek user yang ingin melakukan update sesuai dengan usernamenya atau yang ingin melakukan update adalah admmin
  if (
    req.userId == req.params.id || // jika user yang login
    req.levelId == 1 || //jika superadmin
    req.levelId == 2 // jika admin
  ) {
    try {
      const checkUser = await Users.findOne({
        where: { id: req.params.id },
      });
      if (!checkUser)
        return res
          .status(404)
          .json({ error: true, message: "User tidak ditemukan" });

      // console.log(req.body);
      if (req.body.phone_number) {
        const phoneNumber = formatter.phoneNumberFormatter(
          req.body.phone_number
        );
        const checkNohp = await Users.findOne({
          where: {
            phone_number: phoneNumber,
          },
        });
        if (checkNohp)
          return res
            .status(400)
            .json({ error: true, message: "No handphone sudah terdaftar" });
        const code = Math.floor(100000 + Math.random() * 900000);
        const expired = Date.now() + 2 * 60 * 1000; // 2menit

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
      } else {
        await checkUser.update(req.body);

        res
          .status(200)
          .json({ error: false, message: "User berhasil diupdate" });
      }
    } catch (error) {
      console.log(error);
      res.status(403).json({ error: true, message: error.errors[0].message });
    }
  } else {
    res
      .status(403)
      .json({ error: true, message: "Kamu tidak dapat akses ini" });
  }
};

// update PhoneNumber
const updatePhone = async (req, res) => {
  try {
    const nohp = req.phone_number;
    const checkUser = await Users.findOne({
      where: {
        phone_number: nohp,
      },
    });
    if (checkUser)
      return res
        .status(400)
        .json({ error: true, message: "No handphone sudah terdaftar" });

    await Users.update(
      { phone_number: nohp },
      { where: { id: req.params.id } }
    );
    res
      .status(200)
      .json({ error: false, message: "No handphone berhasil diupdate" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: true, message: "Terjadi kesalahan pada server" });
  }
};

// UPDATE AVATAR USER
const updateAvatar = async (req, res) => {
  if (!req.file)
    return res
      .status(404)
      .json({ error: true, message: "Gambar harus diupload" });

  const image = req.file.path;
  try {
    const checkUser = await Users.findOne({
      where: { id: req.params.id },
    });
    if (!checkUser)
      return res
        .status(404)
        .json({ error: true, message: "User tidak ditemukan" });

    await checkUser.update({ profile_picture: image });
    res.status(200).json({ error: false, message: "Avatar berhasil diupdate" });
  } catch (error) {
    res.status(400).json(error);
  }
};

// FOLLOW A USER
const followUser = async (req, res) => {
  const senderId = req.userId;
  const receiverId = req.params.id;
  try {
    if (senderId != receiverId) {
      const receiverUser = await Users.findOne({
        where: {
          id: receiverId,
        },
      });
      const currentUser = await Users.findOne({
        where: {
          id: senderId,
        },
      });

      //check username yang difollow apakah ada
      if (!receiverUser)
        return res.status(404).json({
          error: true,
          message: "Username tidak ditemukan",
        });

      // Check apakah sudah difollow atau belum
      const checkFollow = await Follows.findOne({
        where: {
          sender_id: currentUser.id,
          receiver_id: receiverUser.id,
        },
      });
      // jika ad = sudah follow
      if (checkFollow)
        return res.status(404).json({
          error: true,
          message: "Kamu sudah follow user ini",
        });
      const followUser = await Follows.create({
        sender_id: currentUser.id,
        receiver_id: receiverUser.id,
      });
      // userToFollow = receiverUser;
      // await receiverUser.addFollowers(currentUser); => belongs to many
      res.status(200).json({
        error: false,
        message: "User berhasil difollow",
      });
    } else {
      res.status(403).json({
        error: true,
        message: "Kamu tidak bisa follow akunmu sendiri",
      });
    }
  } catch (error) {
    res.status(500).json({ error: true, message: error });
  }
};

// UNFOLLOW A USER
const unfollowUser = async (req, res) => {
  const senderId = req.userId;
  const receiverId = req.params.id;
  try {
    if (senderId != receiverId) {
      const receiverUser = await Users.findOne({
        where: {
          id: receiverId,
        },
      });
      const currentUser = await Users.findOne({
        where: {
          id: senderId,
        },
      });

      //check username yang difollow apakah ada
      if (!receiverUser)
        res.status(404).json({
          error: true,
          message: "Username tidak ditemukan",
        });

      // Check apakah sudah difollow atau belum
      const checkFollow = await Follows.findOne({
        where: {
          sender_id: currentUser.id,
          receiver_id: receiverUser.id,
        },
      });
      // jika belum ada = belum follow = tidak bisa unfollow
      if (!checkFollow)
        return res.status(404).json({
          error: true,
          message: "Kamu belum follow user ini",
        });

      await Follows.destroy({
        where: {
          sender_id: currentUser.id,
          receiver_id: receiverUser.id,
        },
      });
      res.status(200).json({
        error: false,
        message: "User berhasil diunfollow",
      });
    } else {
      res.status(403).json({
        error: true,
        message: "Kamu tidak bisa unfollow akunmu sendiri",
      });
    }
  } catch (error) {}
};

// GET FOLLOWING
const getFollowers = async (req, res) => {
  try {
    const follow = await Follows.findAll({
      where: {
        receiver_id: req.params.id,
      },
      include: [
        {
          model: Users,
          as: "follower",
          attributes: [
            "phone_number",
            "email",
            "username",
            "full_name",
            "bio",
            "gender",
          ],
        },
      ],
    });

    return res.status(200).json({ error: false, message: follow });
  } catch (error) {
    res.status(500).json({ error: true, message: error });
  }
};

// GET FOLLOWING
const getFollowing = async (req, res) => {
  try {
    const follow = await Follows.findAll({
      where: {
        sender_id: req.params.id,
      },
      include: [
        {
          model: Users,
          as: "following",
          attributes: [
            "phone_number",
            "email",
            "username",
            "full_name",
            "bio",
            "gender",
          ],
        },
      ],
    });
    return res.status(200).json({ error: false, message: follow });
  } catch (error) {
    res.status(500).json({ error: true, message: error });
  }
};

// SEARCH USER
const searchUser = async (req, res) => {
  try {
    if (req.query.username == "")
      return res
        .status(404)
        .json({ error: true, message: "masukkan username yang ingin dicari" });
    const user = await Users.findAll({
      attributes: {
        exclude: ["refresh_token"],
      },
      where: {
        username: { [Op.like]: `%${req.query.username}%` },
      },
    });
    return res.status(200).json({ error: false, message: user });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

// CHECK USER
const checkUser = async (req, res) => {
  try {
    // console.log(req.params.id);
    const check = await Users.findOne({
      where: {
        username: req.params.username,
      },
    });
    // console.log(user);
    if (check) {
      return res
        .status(400)
        .json({ error: true, message: "Username sudah terdaftar" });
    }
    res.status(200).json({ error: false, message: "Username bisa dipakai" });
  } catch (error) {
    return res.status(400).json({ error: true, message: error });
  }
};

// DELETE USER
const destroy = async (req, res) => {
  try {
    if (req.body.key != "asdjklsa908a9djl98")
      return res
        .status(406)
        .json({ error: true, message: "Tidak dapat akses ini" });
    const check = await Users.findOne({
      where: {
        id: req.body.id,
      },
    });
    if (!check)
      return res
        .status(404)
        .json({ error: true, message: "User tidak ditemukan" });

    await check.destroy();
    return res
      .status(200)
      .json({ error: false, message: "User berhasil dihapus" });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Error delete user",
    });
  }
};

// USER POST LIKE
// ADD EMAIL WITH OTP

module.exports = {
  getUsers,
  getUser,
  updateUser,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUser,
  updatePhone,
  updateAvatar,
  checkUser,
  destroy,
};
