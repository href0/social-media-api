const { validationResult } = require("express-validator");
const Post = require("../models/PostModel");
const Users = require("../models/UserModel");
const Follows = require("../models/FollowModel");
const postLikes = require("../models/PostLikes");
const Like = require("../models/PostLikes");
const { Op } = require("sequelize");
const Comment = require("../models/CommentModel");
const replyComment = require("../models/replyComment");

// create (VALIDASI BELUM ADA)
const create = async (req, res) => {
  if (!req.file)
    return res
      .status(400)
      .json({ error: true, message: "Gambar harus diupload" });
  if (!req.body.title)
    return res.status(400).json({ error: true, message: "Title harus diisi" });

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
    res.status(200).json({ error: false, message: addPost });
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
    if (post.userId != req.userId)
      return res.status(403).json({
        error: true,
        message: "UserId tidak cocok, Tidak bisa mengubah post orang lain",
      });

    const updatePost = await post.update({
      title_post: req.body.title,
      desc_post: req.body.desc,
    });
    res.status(200).json({ error: false, message: updatePost });
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
    res.status(200).json({ error: false, message: "Post berhasil dihapus" });
  } catch (error) {
    res.status(400).json({ error: true, message: error });
  }
};

// GET A POST
const getPost = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(400)
        .json({ errro: true, message: "Isi paramater terlebih dahulu" });
    }
    const post = await Post.findOne({
      where: {
        id: req.params.id,
      },
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
              ],
            },
          ],
        },
      ],
    });
    if (!post)
      return res
        .status(404)
        .json({ error: true, message: "Post tidak ditemukan" });
    res.status(200).json({ error: false, message: post });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// GET ALL POST
const getAll = async (req, res) => {
  try {
    const posts = await Post.findAll({
      order: [["UpdatedAt", "DESC"]],
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
              ],
            },
          ],
        },
      ],
      offset: Number(req.params.offset) ? Number(req.params.offset) : 0,
      limit: Number(req.params.limit) ? Number(req.params.limit) : 10,
    });

    res.status(200).json({ error: false, message: posts });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
};

// LIKE A POST
const likePost = async (req, res) => {
  try {
    const post = await Post.findOne({ where: { id: req.body.postId } });
    if (!post)
      return res
        .status(404)
        .json({ error: true, message: "Post tidak ditemukan" });

    const checkLike = await Like.findOne({
      where: {
        userId: req.userId,
        postId: req.body.postId,
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
      .json({ error: false, message: "Post berhasil dilike" });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

// UNLIKE POST
const unlikePost = async (req, res) => {
  try {
    const post = await Post.findOne({ where: { id: req.body.postId } });
    if (!post)
      return res
        .status(404)
        .json({ error: true, message: "Post tidak ditemukan" });

    const checkLike = await Like.findOne({
      where: {
        userId: req.userId,
        postId: req.body.postId,
      },
    });

    if (!checkLike)
      return res
        .status(400)
        .json({ error: true, message: "Post belum dilike" });

    await Like.destroy({
      where: {
        postId: post.id,
        userId: req.userId,
      },
    });
    return res
      .status(200)
      .json({ error: false, message: "Post berhasil diunlike" });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message });
  }
};

// GET TIMELINE POST
const timeline = async (req, res) => {
  try {
    const following = await Follows.findAll({
      where: {
        sender_id: req.userId,
      },
    });
    let arr = [req.userId];
    const followingId = await Promise.all(
      following.map((element) => {
        arr.push(element.receiver_id);
      })
    );

    const userPosts = await Post.findAll({
      where: {
        userId: { [Op.in]: arr },
      },
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
              ],
            },
          ],
        },
      ],
      offset: Number(req.params.offset) ? Number(req.params.offset) : 0,
      limit: Number(req.params.limit) ? Number(req.params.limit) : 10,
      order: [["updatedAt", "DESC"]],
    });

    // const followingPosts = await Promise.all(
    //   following.map((element) => {
    //     return Post.findAll({
    //       where: {
    //         userId: element.receiver_id,
    //       },
    //       include: [
    //         {
    //           attributes: ["username", "full_name", "profile_picture"],
    //           model: Users,
    //           required: true,
    //         },
    //         {
    //           attributes: ["userId"],
    //           model: postLikes,
    //         },
    //         {
    //           model: Comment,
    //           required: false,
    //           include: [
    //             {
    //               attributes: ["username", "full_name", "profile_picture"],
    //               model: Users,
    //             },
    //             {
    //               model: replyComment,
    //               as: "reply",
    //               include: [
    //                 {
    //                   attributes: ["username", "full_name", "profile_picture"],
    //                   model: Users,
    //                 },
    //                 {
    //                   attributes: ["username"],
    //                   as: "parent",
    //                   model: Users,
    //                 },
    //               ],
    //             },
    //           ],
    //         },
    //       ],
    //       offset: Number(req.params.offset) ? Number(req.params.offset) : 0,
    //       limit: Number(req.params.limit) ? Number(req.params.limit) : 5,
    //       order: [["updatedAt", "DESC"]],
    //     });
    //   })
    // );

    //const allPosts = userPosts.concat(...followingPosts); // menggabungkan userpost dengan followingpost
    const sortPostsByDate = await userPosts.sort((a, b) => {
      // menyortir semua post berdasarkan UpdateAt menggunakan DESC
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    res.status(200).json({ error: false, message: sortPostsByDate });
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
const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: {
        userId: req.params.userid,
      },
      include: {
        attributes: ["username", "full_name", "profile_picture"],
        model: Users,
        required: true,
      },
    });
    res.status(200).json({ error: false, message: posts });
  } catch (error) {
    console.log("Error get User Posts : " + error);
    res.status(500).json({ error: true, message: error.message });
  }
};

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
  getUserPosts,
};
