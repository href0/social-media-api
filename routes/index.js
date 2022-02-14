const router = require("express").Router();

// CONTROLLER
const authController = require("../controllers/Auth.js");
const userController = require("../controllers/User.js");
const postController = require("../controllers/Post.js");

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
  verifyRegisterMiddleware.RegisterMiddleware,
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
  "/user/:username",
  verifyTokenMiddleware.verifyToken,
  userController.getUser
);
router.put(
  "/user/:username",
  verifyTokenMiddleware.verifyToken,
  uploadMiddleware.uploadAvatar,
  userController.updateUser
);

// FOLLOW UNFOLLOW
router.post(
  "/user/follow/:username",
  verifyTokenMiddleware.verifyToken,
  userController.followUser
);
router.delete(
  "/user/follow/:username",
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
  "/post/:id",
  check("title").notEmpty().withMessage("Title tidak boleh kosong"),
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
  "/post/:id",
  verifyTokenMiddleware.verifyToken,
  postController.getPost
);

// GET ALL POST
router.get("/posts/", verifyTokenMiddleware.verifyToken, postController.getAll);

// LIKE A POST
router.post(
  "/post/like/:id",
  verifyTokenMiddleware.verifyToken,
  postController.likePost
);
// UNLIKE A POST
router.delete(
  "/post/unlike/:id",
  verifyTokenMiddleware.verifyToken,
  postController.unlikePost
);

// TIMELINE
router.get(
  "/timeline",
  verifyTokenMiddleware.verifyToken,
  postController.timeline
);

// SEARCH POST
router.get("/posts/search", postController.searchPosts);

/* END CRUD POST */

module.exports = router;
