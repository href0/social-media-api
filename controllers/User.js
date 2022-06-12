const Users = require("../models/UserModel.js");
const Posts = require("../models/PostModel.js");
const Follows = require("../models/FollowModel.js");
const { Op, where } = require("sequelize");
const formatter = require("../helper/formatter.js");
const Otp = require("../models/OtpModel.js");
const axios = require("axios");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const emailValidator = require("email-validator");
const { check } = require("express-validator");
const postLikes = require("../models/PostLikes.js");
const commentLike = require("../models/CommentLike.js");
const replyComment = require("../models/replyComment.js");
const replyCommentLike = require("../models/ReplyCommentLike.js");
const Comment = require("../models/CommentModel.js");

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
    let myProfile = false;
    let statusFollow = false;
    const user = await Users.findOne({
      attributes: {
        exclude: ["refresh_token"],
      },
      where: {
        id: req.params.id,
      },
    });
    if (!user) {
      return res
        .status(404)
        .json({ error: true, message: "User tidak ditemukan" });
    }

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

    // check status follow
    const checkStatusFollow = await Follows.findOne({
      where: {
        [Op.and]: [{ sender_id: req.userId }, { receiver_id: user.id }],
      },
    });

    if (checkStatusFollow) {
      statusFollow = true;
    }

    if (req.userId === user.id) {
      myProfile = true;
    }
    const asa = { ...user._previousDataValues, following, followers };
    res.status(200).json({
      error: false,
      message: {
        myProfile,
        statusFollow,
        user: asa,
      },
    });
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

        if (phoneNumber === checkUser.phone_number)
          return res.status(400).json({
            error: true,
            message: "No handphone sama dengan sebelumnya",
          });

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
      } else if (req.body.email) {
        if (emailValidator.validate(req.body.email)) {
          if (req.body.email === checkUser.email)
            return res
              .status(400)
              .json({ error: true, message: "Email sama dengan sebelumnya" });
          // check EMAIL
          const checkEmail = await Users.findOne({
            where: {
              email: req.body.email,
            },
          });
          if (checkEmail)
            return res
              .status(400)
              .json({ error: true, message: "Email sudah terdaftar" });

          const code = Math.floor(100000 + Math.random() * 900000);
          const expired = Date.now() + 2 * 60 * 1000; // 2menit
          await Otp.create({
            phone_number: req.body.email,
            code: code,
            expired: expired,
          });

          let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "karkoon.verif@gmail.com", // generated ethereal user
              pass: "InsyaAllah2022", // generated ethereal password
            },
          });
          let mailOptions = {
            from: "karkoon.verif@gmail.com", // sender address
            to: req.body.email, // list of receivers
            subject: "Verifikasi OTP", // Subject line
            text: `JANGAN MEMBERITAHUKAN KODE INI KEPADA SIAPAPUN. KODE ANDA : ${String(
              code
            )}`,
          };
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log("terjadi kesalahan :" + error);
              return res.status(500).json({
                error: true,
                message: "Terjadi kesalahan pada server",
              });
            } else {
              console.log("berhasil" + info.response);

              return res.status(200).json({
                error: false,
                message: "OTP Berhasil dikirim ke email",
              });
            }
          });
        } else {
          res.status(403).json({ error: true, message: "Format email salah" });
        }
      } else {
        /*
        username = username
        full_name = nama
        bio = bio
        birth_date = tanggal lahir
        gender = jenis kelamin
        skin_type = tipe kulit
        profile_picture = avatar
        */
        if (Object.keys(req.body).length === 0)
          return res
            .status(400)
            .json({ error: true, message: "Body tidak boleh kosong" });

        if (
          req.body.full_name == "" ||
          req.body.bio == "" ||
          req.body.username == "" ||
          req.body.birth_date == "" ||
          req.body.gender == "" ||
          req.body.skin_type == ""
        )
          return res.status(400).json({
            error: true,
            message:
              "Masukkan salah satu body username|full_name|bio|birth_date|gender|skin_type",
          });
        const update = await checkUser.update(req.body);

        res.status(200).json({ error: false, message: update });
      }
    } catch (error) {
      console.log(error);
      res.status(403).json({ error: true, message: error.errors[0].message });
    }
  } else {
    res.status(403).json({ error: true, message: "UserId tidak cocok" });
  }
};

// update EMAIL
const updateEmail = async (req, res) => {
  try {
    if (req.params.id != req.userId)
      return res
        .status(403)
        .json({ error: true, message: "UserId tidak valid" });
    const email = req.phone_number; // ubah nanti saja KEKW
    const checkUser = await Users.findOne({
      where: {
        email: email,
      },
    });
    if (checkUser)
      return res
        .status(400)
        .json({ error: true, message: "Email sudah terdaftar" });

    await Users.update({ email: email }, { where: { id: req.userId } });
    await Otp.destroy({ where: { phone_number: req.email } });
    res.status(200).json({ error: false, message: "Email berhasil diupdate" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: true, message: "Terjadi kesalahan pada server" });
  }
};

// update PhoneNumber
const updatePhone = async (req, res) => {
  try {
    if (req.params.id != req.userId)
      return res
        .status(403)
        .json({ error: true, message: "UserId tidak valid" });
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

    await Users.update({ phone_number: nohp }, { where: { id: req.userId } });
    await Otp.destroy({ where: { phone_number: nohp } });
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
    if (req.query.query == "")
      return res.status(404).json({ error: true, message: "masukkan query" });
    const user = await Users.findAll({
      attributes: {
        exclude: ["refresh_token"],
      },
      where: {
        username: { [Op.like]: `%${req.query.query}%` },
      },
    });

    const posts = await Posts.findAll({
      include: [
        {
          attributes: ["username", "full_name", "profile_picture"],
          model: Users,
          required: true,
        },
        {
          attributes: ["userId"],
          model: postLikes,
        },
        {
          model: Comment,
          required: false,
          include: [
            {
              attributes: ["username", "full_name", "profile_picture"],
              model: Users,
            },
            {
              model: commentLike,
            },
            {
              model: replyComment,
              as: "reply",
              include: [
                {
                  attributes: ["username", "full_name", "profile_picture"],
                  model: Users,
                },
                {
                  attributes: ["username"],
                  as: "parent",
                  model: Users,
                },
                {
                  model: replyCommentLike,
                },
              ],
            },
          ],
        },
      ],
      where: {
        [Op.or]: [
          {
            title_post: {
              [Op.like]: `%${req.query.query}%`,
            },
          },
          {
            desc_post: {
              [Op.like]: `%${req.query.query}%`,
            },
          },
        ],
      },
    });
    return res
      .status(200)
      .json({ error: false, message: { users: user, posts } });
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
  updateEmail,
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
