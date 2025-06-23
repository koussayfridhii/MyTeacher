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
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required."],
    trim: true,
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
