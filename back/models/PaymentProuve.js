import mongoose from "mongoose";

const paymentProuveSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  coordinator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comment: {
    type: String,
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  method: {
    type: String,
    required: true,
    // enum: ["cash", "card", "transfer", "other"], // adjust as needed
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  file: {
    type: String, // URL or path to uploaded proof file
    required: true,
  },
});

const PaymentProuve = mongoose.model("PaymentProuve", paymentProuveSchema);
export default PaymentProuve;
