import express from "express";
import {
  signup,
  verifyEmail,
  signin,
  logout,
  getProfile,
  editProfile,
  resetPassword,
  forgotPassword,
} from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.get("/verify/:token", verifyEmail);
router.post("/signin", signin);

// Protected routes (require valid, single‐session JWT)
router.post("/logout", auth, logout);
router.get("/profile", auth, getProfile);
router.post("/profile-edit", auth, editProfile);
router.post("/reset-password/:token", auth, resetPassword);
router.post("/forgot-password", auth, forgotPassword);

export default router;
