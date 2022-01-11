const Users = require("../models/UserModel.js");
const Follows = require("../models/FollowModel.js");

// Get ALL Users
const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: ["id", "username", "phone_number"],
    });
    res.status(200).json({
      users,
    });
  } catch (error) {
    console.error("getUserError: " + error);
  }
};

// Get a User
const getUser = async (req, res) => {
  try {
    const user = await Users.findOne({
      where: {
        username: req.params.username,
      },
    });
    res.status(200).json({ user });
  } catch (error) {
    console.error("getUserError: " + error);
  }
};

// Update User
const updateUser = async (req, res) => {
  // cek user yang ingin melakukan update sesuai dengan usernamenya atau yang ingin melakukan update adalah admmin
  if (
    req.username === req.params.username || // jika user yang login
    req.levelId == 1 || //jika superadmin
    req.levelId == 2 // jika admin
  ) {
    try {
      const checkUser = await Users.findOne({
        where: { username: req.params.username },
      });
      if (!checkUser)
        return res
          .status(404)
          .json({ error: true, message: "User tidak ditemukan" });

      await Users.update(req.body, {
        where: { username: req.params.username },
      });
      res.status(200).json({ error: null, message: "User berhasil diupdate" });
    } catch (error) {
      res.status(403).json({ error: true, message: error.errors[0].message });
    }
  } else {
    res
      .status(403)
      .json({ error: true, message: "Kamu tidak dapat akses ini" });
  }
};

// Follow a user
const followUser = async (req, res) => {
  const senderUsername = req.username;
  const receiverUsername = req.params.username;
  try {
    if (senderUsername != receiverUsername) {
      const receiverUser = await Users.findOne({
        where: {
          username: receiverUsername,
        },
      });
      const currentUser = await Users.findOne({
        where: {
          username: senderUsername,
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
      res.status(200).json({
        error: null,
        message: "User berhasil difollow",
      });
    } else {
      res.status(403).json({
        error: true,
        message: "Kamu tidak bisa follow akunmu sendiri",
      });
    }
  } catch (error) {}
};

// Unfollow a user
const unfollowUser = async (req, res) => {
  const senderUsername = req.username;
  const receiverUsername = req.params.username;
  try {
    if (senderUsername != receiverUsername) {
      const receiverUser = await Users.findOne({
        where: {
          username: receiverUsername,
        },
      });
      const currentUser = await Users.findOne({
        where: {
          username: senderUsername,
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
        error: null,
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

module.exports = { getUsers, getUser, updateUser, followUser, unfollowUser };
