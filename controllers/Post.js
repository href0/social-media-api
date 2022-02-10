const multer = require("multer");
const Post = require("../models/PostModel");
const uploadConfig = require("../config/UploadImage.js");

// create (VALIDASI BELUM ADA)
const create = async (req, res) => {
  const title = req.body.title;
  const content = req.body.desc;
  const image = req.file.path;
  try {
    const addPost = await Post.create({
      user_id: req.userId,
      title_post: title,
      desc_post: content,
      image_post: image,
    });
    res.status(200).json({ status: "OK", message: addPost });
  } catch (error) {
    res.status(400).json(error);
  }
};

// update
// delete
// like a post
// get all post
// get a post
// get timeline posts

module.exports = { create };
