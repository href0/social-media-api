const Reply = require("../models/replyComment");
const replyCommentLike = require("../models/ReplyCommentLike");

// ADD REPLY COMMENT
const replyComment = async (req, res) => {
  try {
    const { commentId, parentId, replyComment } = req.body;
    const userId = req.userId;
    const create = await Reply.create({
      commentId,
      userId,
      parentId,
      replyComment,
    });
    res
      .status(201)
      .json({ error: false, message: "Berhasil membalas komentar" });
  } catch (error) {
    console.log("Error Reply Comment : " + error);
    return res.status(500).json({ error: true, message: error.message });
  }
};

// UPDATE COMMENT
const update = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(400)
        .json({ error: true, message: "Params belum diisi" });
    }
    const comment = await Reply.findOne({
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
      replyComment: req.body.comment,
    });
    return res
      .status(200)
      .json({ error: false, message: "Komentar berhasil diupdate" });
  } catch (error) {
    console.log("Error update reply commnet : " + error);
    res.status(500).json({ error: true, message: error.message });
  }
};

// DELETE COMMENT
const deleteComment = async (req, res) => {
  try {
    if (!req.params.id) {
      return res
        .status(400)
        .json({ error: true, message: "Params belum diisi" });
    }
    const comment = await Reply.findOne({
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
    const comment = await Reply.findOne({
      where: {
        id: req.body.replyCommentId,
      },
    });

    if (!comment)
      return res
        .status(404)
        .json({ error: true, message: "Komentar tidak ditemukan" });

    const like = await replyCommentLike.findOne({
      where: {
        replyCommentId: req.body.replyCommentId,
        userId: req.userId,
      },
    });
    if (like) {
      return res
        .status(400)
        .json({ error: true, message: "Komentar sudah disukai" });
    }
    await replyCommentLike.create({
      replyCommentId: req.body.replyCommentId,
      userId: req.userId,
    });
    res
      .status(201)
      .json({ error: false, message: "Berhasil menyukai komentar" });
  } catch (error) {
    console.log("Error add like comment : " + error);
    return res.status(500).json({ error: true, message: error.message });
  }
};

// unlike
const deleteLike = async (req, res) => {
  try {
    const comment = await Reply.findOne({
      where: {
        id: req.body.replyCommentId,
      },
    });

    if (!comment)
      return res
        .status(404)
        .json({ error: true, message: "Komentar tidak ditemukan" });
    const like = await replyCommentLike.findOne({
      where: {
        userId: req.userId,
        replyCommentId: req.body.replyCommentId,
      },
    });
    if (!like) {
      return res.status(404).json({
        error: true,
        message: "Like komentar tidak ditemukan atau bukan milik anda",
      });
    }
    await like.destroy();
    return res
      .status(200)
      .json({ error: true, message: "Berhasil unlike komentar" });
  } catch (error) {
    console.log("Error unlike comment : " + error);
    return res.status(500).json({ error: true, error: error.message });
  }
};

// GET COMMENT

module.exports = {
  replyComment,
  update,
  deleteComment,
  likeComment,
  deleteLike,
};
