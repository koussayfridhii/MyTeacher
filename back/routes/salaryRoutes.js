import express from "express";
import { getMySalaryDetails } from "../controllers/salaryController.js";
import authMiddleware from "../middleware/auth.js"; // Corrected import name
import roleCheck from "../middleware/role.js"; // Corrected import name

const router = express.Router();

// @route   GET /api/salary/me
// @desc    Get current coordinator's salary details
// @access  Private (Coordinator only)
router.get(
  "/me",
  authMiddleware, // Ensures user is logged in
  roleCheck("coordinator"), // Ensures user is a coordinator
  getMySalaryDetails
);

export default router;
