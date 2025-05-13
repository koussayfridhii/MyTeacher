import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    meetID: { type: String, required: true },
    cost: { type: Number, default: 10 },
    recordingUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Class", classSchema);
