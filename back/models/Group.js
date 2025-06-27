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
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Assuming 'User' model with role 'student'
          required: true,
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // User who added this student (admin or coordinator)
          required: true,
        },
      },
    ],
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming 'User' model with role 'teacher'
      required: true,
    },
    level: {
      type: String,
      required: true,
      trim: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan", // Assuming 'Plan' model exists
      required: true,
    },
    comments: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // User who created the group (admin or coordinator)
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure that a student can only be in a group once
groupSchema.path("students").validate(function (students) {
  if (!students) return true;
  const studentIds = students.map(s => s.student && s.student.toString());
  const uniqueStudents = new Set(studentIds.filter(id => id)); // Filter out potential null/undefined during validation
  return uniqueStudents.size === studentIds.length;
}, "A student can only be added to a group once.");

const Group = mongoose.model("Group", groupSchema);

export default Group;
