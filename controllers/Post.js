const { validationResult } = require("express-validator");
const Post = require("../models/PostModel");
const Users = require("../models/UserModel");
const Like = require("../models/PostLikes");
const Follows = require("../models/FollowModel");
const postLikes = require("../models/PostLikes");
const { Op } = require("sequelize");

// create (VALIDASI BELUM ADA)
const create = async (req, res) => {
  if (!req.file)
    return res
      .status(404)
      .json({ error: true, message: "Gambar harus diupload" });

  const title = req.body.title;
  const content = req.body.desc;
  const image = req.file.path;
  try {
    const addPost = await Post.create({
      userId: req.userId,
      title_post: title,
      desc_post: content,
      image_post: image,
    });
    res.status(200).json({ error: null, message: addPost });
  } catch (error) {
    res.status(400).json(error);
  }
};

// UPDATE
const update = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ error: true, message: errors["errors"][0].msg });
  }
  try {
    const post = await Post.findOne({ where: { id: req.params.id } });
    if (!post)
      return res
        .status(404)
        .json({ error: true, message: "Post tidak ditemukan" });
    if (post.user_id != req.body.userId)
      return res
        .status(403)
        .json({ error: true, message: "UserId tidak cocok" });

    const updatePost = await post.update({
      title_post: req.body.title,
      desc_post: req.body.desc,
    });
    res.status(200).json({ error: null, message: updatePost });
  } catch (error) {
    res.status(400).json({ error: true, message: error });
  }
};

// DELETE
const deletePost = async (req, res) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.id } });
    // return console.log(post);
    if (!post)
      return res
        .status(404)
        .json({ error: true, message: "Post tidak ditemukan" });
    if (post.user_id != req.body.userId)
      return res
        .status(403)
        .json({ error: true, message: "UserId tidak cocok" });

    await post.destroy();
    res.status(200).json({ error: null, message: "Post berhasil dihapus" });
  } catch (error) {
    res.status(400).json({ error: true, message: error });
  }
};

// GET A POST
const getPost = async (req, res) => {
  try {
    const post = await Post.findOne({
      where: {
        id: req.params.id,
      },
      include: {
        attributes: ["username", "full_name", "profile_picture"],
        model: Users,
        required: true,
      },
    });
    if (!post)
      return res
        .status(404)
        .json({ error: true, message: "Post tidak ditemukan" });
    res.status(200).json({ error: null, message: post });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// GET ALL POST
const getAll = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: Users,
          attributes: ["username", "full_name", "profile_picture"],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    res.status(200).json({ error: null, message: posts });
  } catch (error) {
    res.status(500).json(error);
  }
};

// LIKE A POST
const likePost = async (req, res) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.id } });
    if (!post)
      return res
        .status(404)
        .json({ error: true, message: "Post tidak ditemukan" });

    const checkLike = await Like.findOne({
      where: {
        userId: req.userId,
        postId: req.params.id,
      },
    });

    if (checkLike)
      return res
        .status(400)
        .json({ error: true, message: "Kamu sudah like post ini" });

    await Like.create({
      postId: post.id,
      userId: req.userId,
    });
    return res
      .status(201)
      .json({ error: null, message: "Post berhasil dilike" });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

// UNLIKE POST
const unlikePost = async (req, res) => {
  try {
    const post = await Post.findOne({ where: { id: req.params.id } });
    if (!post)
      return res
        .status(404)
        .json({ error: true, message: "Post tidak ditemukan" });

    const checkLike = await Like.findOne({
      where: {
        userId: req.userId,
        postId: req.params.id,
      },
    });

    if (!checkLike)
      return res
        .status(400)
        .json({ error: true, message: "Kamu belum like post ini" });

    await Like.destroy({
      where: {
        postId: post.id,
        userId: req.userId,
      },
    });
    return res
      .status(201)
      .json({ error: null, message: "Post berhasil diunlike" });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

// GET TIMELINE POST
const timeline = async (req, res) => {
  try {
    const userPosts = await Post.findAll({
      where: {
        userId: req.userId,
      },
      include: {
        attributes: ["username", "full_name", "profile_picture"],
        model: Users,
        required: true,
      },
      include: {
        attributes: ["id"],
        model: postLikes,
      },

      order: [["updatedAt", "DESC"]],
    });

    const following = await Follows.findAll({
      where: {
        sender_id: req.userId,
      },
    });

    const followingPosts = await Promise.all(
      following.map((element) => {
        return Post.findAll({
          where: {
            userId: element.receiver_id,
          },
          include: {
            attributes: ["username", "full_name", "profile_picture"],
            model: Users,
            required: true,
          },
          include: {
            attributes: ["id"],
            model: postLikes,
          },
          order: [["updatedAt", "DESC"]],
        });
      })
    );

    const allPosts = userPosts.concat(...followingPosts); // menggabungkan userpost dengan followingpost
    const sortPostsByDate = await allPosts.sort((a, b) => {
      // menyortir semua post berdasarkan UpdateAt menggunakan DESC
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    res.status(200).json({ error: null, message: sortPostsByDate });
  } catch (error) {
    console.log("Error Timeline : " + error);
    return res.status(500).json({ error: true, message: error.message });
  }
};

// SEARCH POSTS
const searchPosts = async (req, res) => {
  try {
    if (req.query.query == "")
      return res
        .status(404)
        .json({ error: true, message: "masukkan query yang ingin dicari" });
    const user = await Post.findAll({
      include: {
        attributes: ["username", "full_name", "profile_picture"],
        model: Users,
        required: true,
      },
      where: {
        [Op.or]: [
          {
            title_post: { [Op.like]: `%${req.query.query}%` },
          },
          {
            desc_post: { [Op.like]: `%${req.query.query}%` },
          },
        ],
      },
      order: [["updatedAt", "DESC"]],
    });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

// GET USER POSTS
// COMMENT
// LIKE COMMENT

module.exports = {
  create,
  update,
  deletePost,
  getPost,
  getAll,
  likePost,
  unlikePost,
  timeline,
  searchPosts,
};
