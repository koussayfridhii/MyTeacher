import mongoose from "mongoose";

const discountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    percent: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    maxUsage: {
      type: Number,
      required: true,
      min: 1,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Discount = mongoose.model("Discount", discountSchema);
export default Discount;
