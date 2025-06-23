import mongoose from "mongoose";
const Schema = mongoose.Schema;

const contactMessageSchema = new Schema({
  name: {
    type: String,
    required: [true, "Name is required."],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required."],
    trim: true,
    lowercase: true,
    // Basic email format validation
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required."],
    trim: true,
    // Basic phone number validation (allows digits, spaces, hyphens, parentheses, plus)
    // match: [/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, "Please use a valid phone number."]
  },
  message: {
    type: String,
    required: [true, "Message is required."],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("ContactMessage", contactMessageSchema);
