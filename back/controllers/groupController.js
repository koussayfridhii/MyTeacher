import Group from "../models/Group.js";
import Plan from "../models/Plan.js";
import User from "../models/User.js"; // To validate student and teacher roles

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private (Admin, Coordinator)
export const createGroup = async (req, res) => {
  try {
    const { name, students, subject, teacher, level, plan, comments } = req.body;
    const createdBy = req.user.id;

    // Validate Plan
    const groupPlan = await Plan.findById(plan);
    if (!groupPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Validate Teacher
    const teacherUser = await User.findById(teacher);
    if (!teacherUser || teacherUser.role !== "teacher") {
      return res
        .status(400)
        .json({ message: "Invalid teacher selected." });
    }

    // Validate Students
    if (students && students.length > 0) {
      for (const studentId of students) {
        const studentUser = await User.findById(studentId);
        if (!studentUser || studentUser.role !== "student") {
          return res
            .status(400)
            .json({ message: `Invalid student ID: ${studentId}` });
        }
      }
      if (students.length > groupPlan.numberOfStudents) {
        return res.status(400).json({
          message: `Number of students exceeds the plan limit of ${groupPlan.numberOfStudents}`,
        });
      }
    }


    const group = new Group({
      name,
      students: students || [],
      subject,
      teacher,
      level,
      plan,
      comments,
      createdBy,
    });

    const createdGroup = await group.save();
    res.status(201).json(createdGroup);
  } catch (error) {
    console.error("Error creating group:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error while creating group" });
  }
};

// @desc    Get all groups
// @route   GET /api/groups
// @access  Private (Admin, Coordinator)
export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find({})
      .populate("students", "firstName lastName email") // Populate student details
      .populate("teacher", "firstName lastName email") // Populate teacher details
      .populate("plan", "name numberOfStudents") // Populate plan details
      .populate("createdBy", "firstName lastName email"); // Populate creator details
    res.json(groups);
  } catch (error) {
    console.error("Error getting groups:", error);
    res.status(500).json({ message: "Server error while fetching groups" });
  }
};

// @desc    Get a single group by ID
// @route   GET /api/groups/:id
// @access  Private (Admin, Coordinator)
export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("students", "firstName lastName email")
      .populate("teacher", "firstName lastName email")
      .populate("plan", "name numberOfStudents")
      .populate("createdBy", "firstName lastName email");

    if (group) {
      res.json(group);
    } else {
      res.status(404).json({ message: "Group not found" });
    }
  } catch (error) {
    console.error("Error getting group by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// @desc    Add a student to a group
// @route   PUT /api/groups/:id/students/add
// @access  Private (Admin, Coordinator)
export const addStudentToGroup = async (req, res) => {
  try {
    const { studentId } = req.body;
    const group = await Group.findById(req.params.id).populate("plan");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Validate Student
    const studentUser = await User.findById(studentId);
    if (!studentUser || studentUser.role !== "student") {
      return res
        .status(400)
        .json({ message: "Invalid student ID provided." });
    }

    if (group.students.includes(studentId)) {
      return res
        .status(400)
        .json({ message: "Student already in this group" });
    }

    if (group.students.length >= group.plan.numberOfStudents) {
      return res.status(400).json({
        message: `Group is full. Plan limit: ${group.plan.numberOfStudents} students.`,
      });
    }

    group.students.push(studentId);
    await group.save();

    const updatedGroup = await Group.findById(req.params.id)
      .populate("students", "firstName lastName email")
      .populate("teacher", "firstName lastName email")
      .populate("plan", "name numberOfStudents")
      .populate("createdBy", "firstName lastName email");

    res.json(updatedGroup);
  } catch (error) {
    console.error("Error adding student to group:", error);
     if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Remove a student from a group
// @route   PUT /api/groups/:id/students/remove
// @access  Private (Admin, Coordinator)
export const removeStudentFromGroup = async (req, res) => {
  try {
    const { studentId } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const studentIndex = group.students.indexOf(studentId);
    if (studentIndex === -1) {
      return res
        .status(400)
        .json({ message: "Student not found in this group" });
    }

    group.students.splice(studentIndex, 1);
    await group.save();

    const updatedGroup = await Group.findById(req.params.id)
      .populate("students", "firstName lastName email")
      .populate("teacher", "firstName lastName email")
      .populate("plan", "name numberOfStudents")
      .populate("createdBy", "firstName lastName email");

    res.json(updatedGroup);
  } catch (error) {
    console.error("Error removing student from group:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update group details
// @route   PUT /api/groups/:id
// @access  Private (Admin, Coordinator)
export const updateGroup = async (req, res) => {
  try {
    const { name, subject, teacher, level, plan, comments } = req.body;
    const group = await Group.findById(req.params.id).populate("plan");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // If plan is being changed, validate student count against new plan
    if (plan && plan.toString() !== group.plan._id.toString()) {
      const newPlan = await Plan.findById(plan);
      if (!newPlan) {
        return res.status(404).json({ message: "New plan not found" });
      }
      if (group.students.length > newPlan.numberOfStudents) {
        return res.status(400).json({
          message: `Cannot change to plan '${newPlan.name}'. Student count (${group.students.length}) exceeds new plan limit of ${newPlan.numberOfStudents}.`,
        });
      }
      group.plan = newPlan._id;
    }

    if (teacher) {
        const teacherUser = await User.findById(teacher);
        if (!teacherUser || teacherUser.role !== "teacher") {
            return res.status(400).json({ message: "Invalid teacher selected." });
        }
        group.teacher = teacher;
    }


    group.name = name || group.name;
    group.subject = subject || group.subject;
    group.level = level || group.level;
    group.comments = comments || group.comments;
    // Students are managed by add/remove endpoints

    const updatedGroup = await group.save();

    const populatedGroup = await Group.findById(updatedGroup._id)
      .populate("students", "firstName lastName email")
      .populate("teacher", "firstName lastName email")
      .populate("plan", "name numberOfStudents")
      .populate("createdBy", "firstName lastName email");

    res.json(populatedGroup);
  } catch (error) {
    console.error("Error updating group:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a group
// @route   DELETE /api/groups/:id
// @access  Private (Admin, Coordinator)
export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (group) {
      await group.deleteOne(); // or group.remove() for older mongoose
      res.json({ message: "Group removed" });
    } else {
      res.status(404).json({ message: "Group not found" });
    }
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({ message: "Server error" });
  }
};
