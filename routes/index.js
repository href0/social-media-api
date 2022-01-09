import express from "express";
import { sendOTP, Login, Register, Logout } from "../controllers/Auth.js";
import { getUsers, getUser } from "../controllers/User.js";

import { verifyToken } from "../middleware/VerifyToken.js";
import { verifyOtp } from "../middleware/VerifyOtp.js";
import { RegisterMiddleware } from "../middleware/Register.js";

import { refreshToken } from "../controllers/RefreshToken.js";
import { check, validationResult } from "express-validator";

const router = express.Router();

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
  sendOTP
);
// router.post("/auth/otp", verifyOtp);
router.post("/auth/login", verifyOtp, Login);
router.post("/auth/register", RegisterMiddleware, Register);
router.delete("/auth/logout", Logout);

// Users
router.get("/users", verifyToken, getUsers);
router.get("/user", verifyToken, getUser);

// Token
router.get("/token", refreshToken);

export default router;
