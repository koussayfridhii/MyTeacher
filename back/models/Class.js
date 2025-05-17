import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    meetID: { type: String, required: true },
    cost: { type: Number, default: 10 },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    topic: { type: String, required: true },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    date: { type: Date, default: Date.now },
    recordingUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Class", classSchema);
