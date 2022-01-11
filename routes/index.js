const router = require("express").Router();
const authController = require("../controllers/Auth.js");
const userController = require("../controllers/User.js");

const verifyTokenMiddleware = require("../middleware/VerifyToken.js");
const verifyOtpMiddleware = require("../middleware/VerifyOtp.js");
const verifyRegisterMiddleware = require("../middleware/Register.js");

const refreshTokenController = require("../controllers/RefreshToken.js");
const { check, validationResult } = require("express-validator");
const verifyOtp = require("../middleware/VerifyOtp.js");

//Auth
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
// router.post("/auth/otp", verifyOtp);
router.post("/auth/login", verifyOtpMiddleware.verifyOtp, authController.Login);
router.post(
  "/auth/register",
  verifyRegisterMiddleware.RegisterMiddleware,
  authController.Register
);
router.delete("/auth/logout", authController.Logout);

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
  userController.updateUser
);
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

// Token
router.get("/token", refreshTokenController.refreshToken);

module.exports = router;
