import express from "express";
import {
  createContactMessage,
  listContactMessages,
} from "../controllers/contactMessageController.js";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";

const router = express.Router();

// @desc    Create a new contact message
// @route   POST /api/contact-messages
// @access  Public
router.post("/", createContactMessage);

// @desc    Get all contact messages
// @route   GET /api/contact-messages
// @access  Private (Admin/Coordinator)
router.get("/", auth, role("admin", "coordinator"), listContactMessages);

export default router;
