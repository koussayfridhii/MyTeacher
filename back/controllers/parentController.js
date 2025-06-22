import Parent from "../models/Parent.js";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js"; // Import Wallet model

// @desc    Create a new parent
// @route   POST /api/parents
// @access  Private (Coordinator or Admin)
export const createParent = async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobileNumber,
      students,
      coordinator: coordinatorId,
    } = req.body;
    const { _id: userId, role } = req.user;
    let coordinator;

    if (role === "coordinator") {
      coordinator = userId;
    } else if (role === "admin") {
      if (!coordinatorId) {
        return res
          .status(400)
          .json({ message: "Coordinator ID is required for admin users" });
      }
      const coordinatorUser = await User.findById(coordinatorId);
      if (!coordinatorUser || coordinatorUser.role !== "coordinator") {
        return res.status(400).json({
          message: "Invalid Coordinator ID or user is not a coordinator",
        });
      }
      coordinator = coordinatorId;
    } else {
      return res
        .status(403)
        .json({ message: "User not authorized to create a parent" });
    }

    // Validate student IDs and check if they are already assigned to another parent
    if (students && students.length > 0) {
      for (const studentId of students) {
        const studentUser = await User.findById(studentId);
        if (!studentUser || studentUser.role !== "student") {
          return res.status(400).json({
            message: `Invalid Student ID: ${studentId} or user is not a student`,
          });
        }
        if (studentUser.parent) {
          return res.status(400).json({
            message: `Student ${studentUser.firstName} ${studentUser.lastName} is already assigned to another parent.`,
          });
        }
      }
    }

    const parent = new Parent({
      fullName,
      email,
      mobileNumber,
      students: students || [],
      coordinator,
      isAssigned: req.user.role === "admin",
    });

    await parent.save();

    // Update the parent field for each assigned student
    if (students && students.length > 0) {
      for (const studentId of students) {
        await User.findByIdAndUpdate(studentId, { parent: parent._id });
      }
    }

    const populatedParent = await Parent.findById(parent._id)
      .populate("students", "firstName lastName email")
      .populate("coordinator", "firstName lastName email");

    res.status(201).json(populatedParent);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      // Duplicate key error (email)
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Server error while creating parent" });
  }
};

// @desc    Get all parents
// @route   GET /api/parents
// @access  Private (Admin or Coordinator)
export const getAllParents = async (req, res) => {
  try {
    const parents = await Parent.find()
      .populate("students", "firstName lastName email") // Keep basic student info
      .populate("coordinator", "firstName lastName email")
      .lean(); // Use .lean() for plain JS objects to modify them

    if (!parents || parents.length === 0) {
      return res.status(200).json([]);
    }

    // Collect all student IDs from all parents
    const allStudentIds = parents.reduce((acc, parent) => {
      if (parent.students && parent.students.length > 0) {
        parent.students.forEach(student => {
          // Ensure student._id is valid before adding
          if (student && student._id) {
            acc.push(student._id);
          }
        });
      }
      return acc;
    }, []);

    let studentWalletsMap = {};
    if (allStudentIds.length > 0) {
      // Fetch wallets for all collected student IDs
      const studentWallets = await Wallet.find({ user: { $in: allStudentIds } }).select("user balance");
      // Create a map of studentId to balance
      studentWalletsMap = studentWallets.reduce((map, wallet) => {
        map[wallet.user.toString()] = wallet.balance;
        return map;
      }, {});
    }

    // Add totalStudentBalances to each parent
    const parentsWithStudentBalances = parents.map(parent => {
      let totalStudentBalances = 0;
      if (parent.students && parent.students.length > 0) {
        parent.students.forEach(student => {
          // student object here is from the populate("students", "firstName lastName email")
          // So student._id should be the correct ID to lookup in studentWalletsMap
          if (student && student._id) {
            totalStudentBalances += studentWalletsMap[student._id.toString()] || 0;
          }
        });
      }
      return {
        ...parent,
        totalStudentBalances
      };
    });

    res.status(200).json(parentsWithStudentBalances);
  } catch (error) {
    console.error("Error in getAllParents:", error);
    res.status(500).json({ message: "Server error while fetching parents" });
  }
};

// @desc    Get a single parent by ID
// @route   GET /api/parents/:id
// @access  Private (Admin or Coordinator)
export const getParentById = async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id)
      .populate("students", "firstName lastName email")
      .populate("coordinator", "firstName lastName email");
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }
    res.status(200).json(parent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching parent" });
  }
};

// @desc    Update a parent's details
// @route   PUT /api/parents/:id
// @access  Private (Admin or Coordinator who owns the parent)
export const updateParent = async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobileNumber,
      coordinator: coordinatorId,
      students,
    } = req.body;
    const { role } = req.user;

    let parent = await Parent.findById(req.params.id);

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Authorization: Coordinators can only update their own parents (or if admin)
    // This check might need refinement based on exact ownership rules if a parent can be "owned" by a coordinator
    // For now, allowing coordinator who is assigned to the parent to update basic details.
    // Admin can update any parent and also change coordinator.

    parent.fullName = fullName || parent.fullName;
    parent.email = email || parent.email;
    parent.mobileNumber = mobileNumber || parent.mobileNumber;

    // Handle student updates
    if (students) {
      const oldStudentIds = parent.students.map((s) => s.toString());
      const newStudentIds = students.map((s) => s.toString());

      const studentsToAdd = newStudentIds.filter(
        (id) => !oldStudentIds.includes(id)
      );
      const studentsToRemove = oldStudentIds.filter(
        (id) => !newStudentIds.includes(id)
      );

      // Check if students to add are already assigned to another parent
      for (const studentId of studentsToAdd) {
        const studentUser = await User.findById(studentId);
        if (!studentUser || studentUser.role !== "student") {
          return res.status(400).json({
            message: `Invalid Student ID: ${studentId} or user is not a student.`,
          });
        }
        // Allow if student is currently assigned to THIS parent (e.g. no change)
        // Or if student.parent is null
        if (studentUser.parent && studentUser.parent.toString() !== parent._id.toString()) {
          return res.status(400).json({
            message: `Student ${studentUser.firstName} ${studentUser.lastName} is already assigned to another parent.`,
          });
        }
      }

      // Update parent field for students to add
      for (const studentId of studentsToAdd) {
        await User.findByIdAndUpdate(studentId, { parent: parent._id });
      }

      // Clear parent field for students to remove
      for (const studentId of studentsToRemove) {
        await User.findByIdAndUpdate(studentId, { parent: null });
      }
      parent.students = students; // Assign the new list of student IDs
    } else if (students === null || students === undefined) {
      // If students field is explicitly passed as null/undefined, keep existing students
      // This means no change to the students list unless `students: []` is passed
    }


    if (role === "admin" && coordinatorId) {
      const coordinatorUser = await User.findById(coordinatorId);
      if (!coordinatorUser || coordinatorUser.role !== "coordinator") {
        return res.status(400).json({
          message: "Invalid Coordinator ID or user is not a coordinator",
        });
      }
      parent.coordinator = coordinatorId;
    } else if (
      role === "admin" &&
      req.body.hasOwnProperty("coordinator") &&
      !coordinatorId
    ) {
      // Admin trying to set coordinator to null explicitly - might need business logic decision if this is allowed
      // For now, we assume coordinatorId must be provided if coordinator field is intended to be changed by admin
      return res.status(400).json({
        message: "Coordinator ID must be provided to change coordinator",
      });
    }

    await parent.save();

    const populatedParent = await Parent.findById(parent._id)
      .populate("students", "firstName lastName email")
      .populate("coordinator", "firstName lastName email");

    res.status(200).json(populatedParent);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      // Duplicate key error (email)
      return res
        .status(400)
        .json({ message: "Email already exists for another parent" });
    }
    res.status(500).json({ message: "Server error while updating parent" });
  }
};

// @desc    Delete a parent
// @route   DELETE /api/parents/:id
// @access  Private (Admin)
export const deleteParent = async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id);

    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    // Clear the parent field for all students associated with this parent
    if (parent.students && parent.students.length > 0) {
      for (const studentId of parent.students) {
        await User.findByIdAndUpdate(studentId, { parent: null });
      }
    }

    await parent.deleteOne();

    res.status(200).json({ message: "Parent deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while deleting parent" });
  }
};

// @desc    Add a student to a parent
// @route   POST /api/parents/:parentId/students
// @access  Private (Admin or Coordinator who owns parent)
export const addStudentToParent = async (req, res) => {
  try {
    const { parentId } = req.params;
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    const studentUser = await User.findById(studentId);
    if (!studentUser || studentUser.role !== "student") {
      return res
        .status(400)
        .json({ message: "Invalid Student ID or user is not a student" });
    }

    // Check if student is already assigned to ANY parent
    if (studentUser.parent) {
      if (studentUser.parent.toString() === parentId) {
        return res
          .status(400)
          .json({ message: "Student already added to this parent" });
      } else {
        return res.status(400).json({
          message: `Student ${studentUser.firstName} ${studentUser.lastName} is already assigned to another parent.`,
        });
      }
    }

    // Prevent duplicate students (this check is technically redundant if studentUser.parent check is comprehensive)
    // However, keeping it as a safeguard for direct manipulation or edge cases.
    if (parent.students.includes(studentId)) {
      return res
        .status(400)
        .json({ message: "Student already added to this parent (direct check)" });
    }

    parent.students.push(studentId);
    await parent.save();

    // Update student's parent field
    await User.findByIdAndUpdate(studentId, { parent: parent._id });

    const populatedParent = await Parent.findById(parentId)
      .populate("students", "firstName lastName email")
      .populate("coordinator", "firstName lastName email");

    res.status(200).json(populatedParent);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while adding student to parent" });
  }
};

// @desc    Remove a student from a parent
// @route   DELETE /api/parents/:parentId/students/:studentId
// @access  Private (Admin or Coordinator who owns parent)
export const removeStudentFromParent = async (req, res) => {
  try {
    const { parentId, studentId } = req.params;

    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ message: "Parent not found" });
    }

    const studentIndex = parent.students.indexOf(studentId);
    if (studentIndex === -1) {
      return res
        .status(404)
        .json({ message: "Student not found in this parent's list" });
    }

    parent.students.splice(studentIndex, 1);
    await parent.save();

    // Clear student's parent field
    await User.findByIdAndUpdate(studentId, { parent: null });

    const populatedParent = await Parent.findById(parentId)
      .populate("students", "firstName lastName email")
      .populate("coordinator", "firstName lastName email");

    res.status(200).json(populatedParent);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while removing student from parent" });
  }
};
