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
router.post("/auth/signup", signup);
router.get("/auth/verify/:token", verifyEmail);
router.post("/auth/signin", signin);

// Protected routes (require valid, single‐session JWT)
router.post("/auth/logout", auth, logout);
router.get("/auth/profile", auth, getProfile);

export default router;
