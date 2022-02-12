const { validationResult } = require("express-validator");
const Post = require("../models/PostModel");
const Users = require("../models/UserModel");

// create (VALIDASI BELUM ADA)
const create = async (req, res) => {
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
    const post = await Post.findOne({ where: { id: req.params.id } });
    const user = await Users.findOne({ where: { id: post.user_id } });
    const { refresh_token, ...other } = user._previousDataValues;
    if (!post)
      return res
        .status(404)
        .json({ error: true, message: "Post tidak ditemukan" });
    res.status(200).json({ error: null, message: { post: post, user: other } });
  } catch (error) {
    res.status(500).json({ error: true, message: error });
  }
};

// GET ALL POST
const getAll = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: Users,
          attributes: {
            exclude: ["refresh_token"],
          },
        },
      ],
    });

    res.status(200).json({ error: null, message: posts });
  } catch (error) {
    res.status(500).json(error);
  }
};

// like a post
// get timeline posts

module.exports = { create, update, deletePost, getPost, getAll };
