import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (teacherId) {
          if (!teacherId) return false;
          const User = mongoose.model("User");
          const teacher = await User.findById(teacherId);
          return teacher && teacher.role === "teacher";
        },
        message: "Teacher must be a valid user with role 'teacher'.",
      },
    },
    level: {
      type: String,
      required: true,
      trim: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    comments: {
      type: String,
      trim: true,
    },
    maxStudents: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Group", groupSchema);
