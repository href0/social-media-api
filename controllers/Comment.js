const Comment = require("../models/CommentModel");
const Post = require("../models/PostModel");
const commentLike = require("../models/CommentLike");
const replyCommentLike = require("../models/ReplyCommentLike");

// ADD
const addComment = async (req, res) => {
  try {
    if (!req.body.comment)
      return res
        .status(400)
        .json({ error: true, message: "Komentar tidak boleh kosong" });

    const postId = req.body.postId;
    const userId = req.userId;
    const comment = req.body.comment;

    const post = await Post.findOne({
      where: {
        id: postId,
      },
    });
    if (!post) {
      return res
        .status(404)
        .json({ error: true, message: "Post tidak ditemukan" });
    }
    await Comment.create({
      comment,
      userId,
      postId,
    });
    return res
      .status(201)
      .json({ error: false, message: "Berhasil mengirim komentar" });
  } catch (error) {
    console.log("Error Comment : " + error.message);
    res.status(500).json({ error: true, message: error.message });
  }
};

// UPDATE
const update = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(400)
        .json({ error: true, message: "Params belum diisi" });
    }
    const comment = await Comment.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!comment) {
      return res
        .status(404)
        .json({ error: true, message: "Komentar tidak ditemukan" });
    }
    if (comment.userId !== req.userId)
      return res.status(403).json({
        error: true,
        message: "Tidak bisa mengubah komentar orang lain",
      });
    await comment.update({
      comment: req.body.comment,
    });
    return res
      .status(200)
      .json({ error: false, message: "Komentar berhasil diupdate" });
  } catch (error) {
    console.log("Error update commnet : " + error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// DELETE
const deleteComment = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(400)
        .json({ error: true, message: "Params belum diisi" });
    }
    const comment = await Comment.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!comment) {
      return res
        .status(404)
        .json({ error: true, message: "Komentar tidak ditemukan" });
    }
    if (comment.userId !== req.userId)
      return res.status(403).json({
        error: true,
        message: "Tidak bisa menghapus komentar orang lain",
      });
    await comment.destroy();
    return res
      .status(200)
      .json({ error: false, message: "Komentar berhasil dihapus" });
  } catch (error) {
    console.log("Error delete comment : " + error);
    return res.status(500).json({ error: true, message: error.message });
  }
};

// like
const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({
      where: {
        id: req.body.commentId,
      },
    });

    if (!comment)
      return res
        .status(404)
        .json({ error: true, message: "Komentar tidak ditemukan" });

    const like = await commentLike.findOne({
      where: {
        commentId: req.body.commentId,
        userId: req.userId,
      },
    });
    if (like) {
      return res
        .status(400)
        .json({ error: true, message: "Komentar sudah disukai" });
    }
    await commentLike.create({
      commentId: req.body.commentId,
      userId: req.userId,
    });
    res
      .status(200)
      .json({ error: false, message: "Berhasil menyukai komentar" });
  } catch (error) {
    console.log("Error add like comment : " + error);
    return res.status(500).json({ error: true, message: error.message });
  }
};

// unlike
const deleteLike = async (req, res) => {
  try {
    const comment = await Comment.findOne({
      where: {
        id: req.body.commentId,
      },
    });

    if (!comment)
      return res
        .status(404)
        .json({ error: true, message: "Komentar tidak ditemukan" });

    const like = await commentLike.findOne({
      where: {
        userId: req.userId,
        commentId: req.body.commentId,
      },
    });
    if (!like) {
      return res.status(404).json({
        error: true,
        message: "Anda belum like komentar ini atau komentar bukan milik anda",
      });
    }
    await like.destroy();
    return res
      .status(200)
      .json({ error: false, message: "Berhasil unlike komentar" });
  } catch (error) {
    console.log("Error unlike comment : " + error);
    return res.status(500).json({ error: true, error: error.message });
  }
};

// GET COMMENT LIKE
const getCommentLike = async (req, res) => {
  try {
    const comments = await commentLike.findAll({
      where: {
        commentId: req.params.commentId,
      },
    });
    res.status(200).json({ error: false, message: comments });
  } catch (error) {
    console.log("Error unlike comment : " + error);
    return res
      .status(500)
      .json({ error: true, error: "Terjadi kesalahan pada server" });
  }
};

module.exports = {
  addComment,
  update,
  deleteComment,
  likeComment,
  deleteLike,
  getCommentLike,
};
