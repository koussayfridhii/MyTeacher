import mongoose from "mongoose";

const parentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    trim: true,
  },
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],
  coordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  isAssigned: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Parent", parentSchema);
