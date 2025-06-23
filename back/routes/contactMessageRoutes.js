import express from "express";
import {
  createContactMessage,
  listContactMessages,
} from "../controllers/contactMessageController.js";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js"; // Assuming you want to protect the list route

const router = express.Router();

// @desc    Create a new contact message
// @route   POST /api/contact-messages
// @access  Public
router.post("/", createContactMessage);

// @desc    Get all contact messages
// @route   GET /api/contact-messages
// @access  Private (Admin/Coordinator)
router.get("/", auth, role("admin", "coordinator"), listContactMessages);
// If you want any authenticated user to see them, you could use:
// router.get("/", auth, listContactMessages);
// Or if you have more specific roles, adjust as needed.

export default router;
