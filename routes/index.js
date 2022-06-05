const router = require("express").Router();

// CONTROLLER
const authController = require("../controllers/Auth.js");
const userController = require("../controllers/User.js");
const postController = require("../controllers/Post.js");
const commentController = require("../controllers/Comment.js");
const replyComment = require("../controllers/ReplyComment.js");

// MIDDLEWARE
const verifyTokenMiddleware = require("../middleware/VerifyToken.js");
const verifyOtpMiddleware = require("../middleware/VerifyOtp.js");
const verifyRegisterMiddleware = require("../middleware/Register.js");
const uploadMiddleware = require("../middleware/Upload.js");
const socialAuthMiddleware = require("../middleware/SocialAuth.js");

const refreshTokenController = require("../controllers/RefreshToken.js");
const { check, validationResult } = require("express-validator");
const verifyOtp = require("../middleware/VerifyOtp.js");

/* AUTH*/

// SEND OTP
router.post(
  "/auth",
  check("phone_number")
    .notEmpty()
    .withMessage("No handphone harus diisi")
    .isLength({ min: 11 })
    .withMessage("No handphone tidak valid")
    .matches(/^[0-9]+$/)
    .withMessage("No handphone tidak valids"),
  authController.sendOTP
);

// LOGIN
router.post("/auth/login", verifyOtpMiddleware.verifyOtp, authController.Login);

// REGISTER
router.post(
  "/auth/register",
  // verifyRegisterMiddleware.RegisterMiddleware,
  authController.Register
);

// SOCIAL AUTH
router.post(
  "/auth/social",
  socialAuthMiddleware.verifyToken,
  authController.LoginSocial
);

// CHECK USERNAME
router.post("/auth/checkusername", authController.checkUsername);

// LOGOUT
router.delete("/auth/logout", authController.Logout);

/* END AUTH*/

// Users
router.get(
  "/users",
  verifyTokenMiddleware.verifyToken,
  userController.getUsers
);
router.get(
  "/user/:id?",
  verifyTokenMiddleware.verifyToken,
  userController.getUser
);

// edit
router.put(
  "/user/:id?",
  verifyTokenMiddleware.verifyToken,
  // uploadMiddleware.uploadAvatar,
  userController.updateUser
);

// edit phone
router.put(
  "/userphone/:id?",
  verifyTokenMiddleware.verifyToken,
  verifyOtpMiddleware.verifyOtp,
  userController.updatePhone
);

// edit phone
router.put(
  "/useremail/:id?",
  verifyTokenMiddleware.verifyToken,
  verifyOtpMiddleware.verifyOtp,
  userController.updateEmail
);

// edit avatar
router.put(
  "/useravatar/:id",
  verifyTokenMiddleware.verifyToken,
  uploadMiddleware.uploadAvatar,
  userController.updateAvatar
);

//CHECK USEr
router.get("/user/check/:username", userController.checkUser);

// FOLLOW UNFOLLOW
router.post(
  "/user/follow/:id",
  verifyTokenMiddleware.verifyToken,
  userController.followUser
);
router.delete(
  "/user/follow/:id",
  verifyTokenMiddleware.verifyToken,
  userController.unfollowUser
);

// get Followers
router.get(
  "/user/:id/followers",
  verifyTokenMiddleware.verifyToken,
  userController.getFollowers
);
// get Following
router.get(
  "/user/:id/following",
  verifyTokenMiddleware.verifyToken,
  userController.getFollowing
);

// SEARCH USER
router.get("/search", userController.searchUser);

// DELETE USER
router.delete("/user/delete", userController.destroy);

// Token
router.get("/token", refreshTokenController.refreshToken);

/* CRUD POST */

// CREATE
router.post(
  "/post",
  verifyTokenMiddleware.verifyToken,
  uploadMiddleware.uploadPost,
  postController.create
);

// UPDATE
router.put(
  "/post/:id?",
  check("title").notEmpty().withMessage("Title tidak boleh kosong"),
  verifyTokenMiddleware.verifyToken,
  postController.update
);

// DELETE
router.delete(
  "/post/:id",
  verifyTokenMiddleware.verifyToken,
  postController.deletePost
);

// GET A POST
router.get(
  "/post/:id?",
  verifyTokenMiddleware.verifyToken,
  postController.getPost
);

// GET USER POSTS
router.get(
  "/post/user/:userid",
  verifyTokenMiddleware.verifyToken,
  postController.getUserPosts
);

// GET ALL POST
router.get(
  "/posts/:offset?/:limit?",
  verifyTokenMiddleware.verifyToken,
  postController.getAll
);

// LIKE A POST
router.post(
  "/like_post",
  verifyTokenMiddleware.verifyToken,
  postController.likePost
);
// UNLIKE A POST
router.delete(
  "/like_post",
  verifyTokenMiddleware.verifyToken,
  postController.unlikePost
);

// TIMELINE
router.get(
  "/timeline/:offset?/:limit?",
  verifyTokenMiddleware.verifyToken,
  postController.timeline
);

// SEARCH POST
router.get("/posts/search", postController.searchPosts);

/* END CRUD POST */

/* CRUD COMMENT */

// GETALL
router.get(
  "/commentlike/:commentId?",
  verifyTokenMiddleware.verifyToken,
  commentController.getCommentLike
);

// CREATE
router.post(
  "/comment",
  verifyTokenMiddleware.verifyToken,
  commentController.addComment
);

// UPDATE
router.put(
  "/comment/:id?",
  verifyTokenMiddleware.verifyToken,
  commentController.update
);

// DELETE
router.delete(
  "/comment/:id?",
  verifyTokenMiddleware.verifyToken,
  commentController.deleteComment
);

// LIKE COMMENT
router.post(
  "/like_comment",
  verifyTokenMiddleware.verifyToken,
  commentController.likeComment
);

// UNLIKE COMMENT
router.delete(
  "/like_comment",
  verifyTokenMiddleware.verifyToken,
  commentController.deleteLike
);

/* END CRUD COMMENT */

/* CRUD REPLY COMMENT */

// GET ALL

// CREATE
router.get(
  "/replycommentlike/:replyCommentId?",
  verifyTokenMiddleware.verifyToken,
  replyComment.getCommentLike
);
// CREATE
router.post(
  "/replycomment",
  check("parentId").notEmpty().withMessage("ParentId tidak boleh kosong"),
  check("replyComment").notEmpty().withMessage("Komentar tidak boleh kosong"),
  check("commentId").notEmpty().withMessage("CommentId tidak boleh kosong"),
  verifyTokenMiddleware.verifyToken,
  replyComment.replyComment
);

// UPDATE
router.put(
  "/replycomment/:id?",
  verifyTokenMiddleware.verifyToken,
  replyComment.update
);

// DELETE
router.delete(
  "/replycomment/:id?",
  verifyTokenMiddleware.verifyToken,
  replyComment.deleteComment
);

// LIKE COMMENT
router.post(
  "/like_replycomment",
  verifyTokenMiddleware.verifyToken,
  replyComment.likeComment
);

// UNLIKE COMMENT
router.delete(
  "/like_replycomment",
  verifyTokenMiddleware.verifyToken,
  replyComment.deleteLike
);

/* END CRUD REPLY COMMENT */

module.exports = router;
