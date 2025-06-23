import ContactMessage from "../models/ContactMessage.js";
import mongoose from "mongoose";

// 1. Create Contact Message (Public)
export const createContactMessage = async (req, res, next) => {
  const { name, email, phone, message } = req.body;

  try {
    // Basic validation check, though schema handles more detailed validation
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ success: false, message: "All fields (name, email, phone, message) are required." });
    }

    const newContactMessage = new ContactMessage({
      name,
      email,
      phone,
      message,
    });

    await newContactMessage.save();

    res.status(201).json({
      success: true,
      message: "Your message has been received. We will get back to you shortly.",
      data: newContactMessage
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: "Validation failed: " + messages.join(". ") });
    }
    console.error("Error in createContactMessage:", error);
    next(error);
  }
};

// 2. List Contact Messages (Admin/Coordinator)
export const listContactMessages = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Error in listContactMessages:", error);
    next(error);
  }
};
