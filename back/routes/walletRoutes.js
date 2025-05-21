import express from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import {
  addPoints,
  attendClass,
  getAllStats,
  getMyWallet,
  getWalletHistory,
  setMinimum,
} from "../controllers/walletController.js";

const router = express.Router();

// Any authenticated user can view their wallet
router.get("/", auth, getMyWallet);

// Admin or Coordinator add points to any wallet
router.patch("/add-points", auth, role("admin", "coordinator"), addPoints);

// Admin or Coordinator set the minimum threshold for a wallet
router.patch("/set-minimum", auth, role("admin", "coordinator"), setMinimum);

// Student attends a class (deduct points + grant recording)
router.post("/attend-class", auth, role("student"), attendClass);
router.get("/history", auth, getWalletHistory);
router.get("/totals", auth, role("admin"), getAllStats);

export default router;
