import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Availability = mongoose.model("Availability", availabilitySchema);

export default Availability;
