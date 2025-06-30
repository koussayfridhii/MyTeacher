import express from "express";
import { handleChatbotInteraction } from "../controllers/chatbotController.js";
import Protect from "../middleware/auth.js"; // Assuming you want to protect this route

const router = express.Router();

// @route   POST /api/chatbot
// @desc    Handle chatbot interaction
// @access  Private (or Public, depending on requirements)
router.post("/", Protect, handleChatbotInteraction);

export default router;
