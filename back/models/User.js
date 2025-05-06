import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Form fields
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      maxlength: 12,
    },
    // “Title” comes from your form (Parent / Student)
    title: {
      type: String,
      enum: ["Parent", "Student"],
      required: true,
    },

    // Internal role for RBAC (admin, coordinator, teacher, etc.)
    role: {
      type: String,
      enum: ["admin", "coordinator", "teacher", "student", "parent"],
      default: "student", // or whatever makes sense
      required: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // For parent → students (only if title === "Parent")
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Teachers need approval
    isApproved: {
      type: Boolean,
      default: function () {
        return this.role !== "teacher";
      },
    },
    currentJti: { type: String, default: null },
    // Classes the student has paid for and can replay
    attendedClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
