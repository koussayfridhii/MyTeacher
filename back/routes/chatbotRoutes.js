import express from 'express';
import { handleChatbotInteraction } from '../controllers/chatbotController.js';
import { protect } from '../middleware/auth.js'; // Assuming you want to protect this route

const router = express.Router();

// @route   POST /api/chatbot
// @desc    Handle chatbot interaction
// @access  Private (or Public, depending on requirements)
router.post('/', protect, handleChatbotInteraction);

export default router;
