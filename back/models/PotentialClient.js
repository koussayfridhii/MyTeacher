import mongoose from "mongoose";
const Schema = mongoose.Schema;

const commentaireSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const potentialClientSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    manager: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (userId) {
          const user = await mongoose.model("User").findById(userId);
          return user && (user.role === "coordinator" || user.role === "admin");
        },
        message: "Manager must be a coordinator or admin.",
      },
    },
    assistant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: async function (userId) {
          if (!userId) return true; // Optional field
          const user = await mongoose.model("User").findById(userId);
          return user && user.role === "coordinator";
        },
        message: "Assistant must be a coordinator.",
      },
    },
    status: {
      type: String,
      enum: ["intéressé", "pas intéressé", "injoignable"],
      required: true,
    },
    commentaires: [commentaireSchema],
  },
  { timestamps: true }
);

export default mongoose.model("PotentialClient", potentialClientSchema);
