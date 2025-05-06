import express from "express";
import {
  signup,
  verifyEmail,
  signin,
  logout,
  getProfile,
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

export default router;
