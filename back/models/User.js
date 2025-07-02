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
    about: {
      type: String,
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
    // “Title” comes from your form (Parent / Student / Teacher)
    title: {
      type: String,
      enum: ["Parent", "Student", "Teacher", ""],
    },

    // Base salary for coordinators
    base_salary: {
      type: Number,
      default: null, // Default to null, can be set for coordinators
      validate: {
        validator: function (val) {
          // Allow null or undefined
          if (val === null || typeof val === 'undefined') {
            return true;
          }
          // If a value is provided, it must be a non-negative number
          // and only applicable if the role is coordinator.
          // Controller logic should ideally ensure this is only set for coordinators.
          if (this.role === "coordinator") {
            return typeof val === 'number' && val >= 0;
          }
          // If not a coordinator, this field should ideally be null or not set.
          // Allowing it to be set but ignored for non-coordinators,
          // or strict validation to prevent setting for non-coordinators.
          // For now, let's ensure if it's set for a coordinator, it's valid.
          // If it's set for a non-coordinator, this validator won't prevent it,
          // but it won't be used.
          return true; // Looser validation for now, relying on controller logic.
        },
        message: props => `Base salary must be a non-negative number. Value: ${props.value}`
      }
    },

    // Internal role for RBAC (admin, coordinator, teacher, student, parent)
    role: {
      type: String,
      enum: ["admin", "coordinator", "teacher", "student", "parent"],
      default: "student",
      required: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // Profile picture URL
    profilePic: {
      type: String,
      trim: true,
      default: null,
    },

    // Single subject taught (only for teachers)
    subject: {
      type: String,
      trim: true,
      validate: {
        validator: function (val) {
          // allow empty or only when role is teacher
          if (!val) return true;
          return this.role === "teacher";
        },
        message: 'Subject can only be assigned to users with role "teacher".',
      },
    },

    // Programs taught (only for teachers)
    programs: {
      type: [String],
      validate: {
        validator: function (val) {
          if (!val || val.length === 0) return true;
          return this.role === "teacher";
        },
        message: 'Programs can only be assigned to users with role "teacher".',
      },
    },

    // Coordinator assignment for teachers and students (optional at creation)
    coordinator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      validate: {
        validator: async function (coordId) {
          if (!coordId) return true; // allow empty initially
          const User = mongoose.model("User");
          const coord = await User.findById(coordId);
          return coord && coord.role === "coordinator";
        },
        message: "Coordinator must be a valid user with role 'coordinator'.",
      },
    },

    // Approval flag: teachers and students must have a coordinator to be approved
    isApproved: {
      type: Boolean,
      default: function () {
        // auto-approve non-teacher/student roles
        return !(this.role === "teacher" || this.role === "student");
      },
    },

    // Max hours per week (only for teachers)
    max_hours_per_week: {
      type: Number,
      validate: {
        validator: function(val) {
          // If the field is not being set (i.e., value is null or undefined), it's always valid as it's optional.
          if (val === null || typeof val === 'undefined') {
            return true;
          }
          // If a value is provided, it must be a number and non-negative.
          // The controller is responsible for ensuring this field is only set on 'teacher' roles.
          if (typeof val === 'number' && val >= 0) {
            return true;
          }
          return false; // Invalid if it's not null/undefined AND not a non-negative number.
        },
        message: props => `Invalid value for max_hours_per_week: '${props.value}'. If provided, value must be a non-negative number.`
      },
      default: null, // Default to null, meaning no limit
    },

    isAssigned: {
      type: Boolean,
      default: false,
    },
    rib: {
      type: String,
    },

    currentJti: { type: String, default: null },

    // Classes the student has paid for and can replay
    attendedClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],

    // Parent assignment for students
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
      default: null,
      validate: {
        validator: async function (parentId) {
          if (!parentId) return true; // Allow null or undefined
          // Only validate if role is student
          if (this.role === "student") {
            const Parent = mongoose.model("Parent");
            const parentDoc = await Parent.findById(parentId);
            return !!parentDoc;
          }
          return true; // For other roles, this field is not strictly validated
        },
        message: "Parent must be a valid ID from the Parent collection.",
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
