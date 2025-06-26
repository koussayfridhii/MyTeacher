import Group from "../models/Group.js";
import Plan from "../models/Plan.js";
import User from "../models/User.js";

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private (Admin, Coordinator)
export const createGroup = async (req, res) => {
  try {
    const { name, subject, teacher, level, plan: planId, comments } = req.body;

    if (!name || !subject || !teacher || !level || !planId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const teacherUser = await User.findById(teacher);
    if (!teacherUser || teacherUser.role !== "teacher") {
      return res
        .status(400)
        .json({ message: "Invalid teacher ID or user is not a teacher" });
    }

    const newGroup = new Group({
      name,
      subject,
      teacher,
      level,
      plan: planId,
      comments,
      maxStudents: plan.maxStudentsPerGroup, // Set maxStudents from plan
      students: [],
    });

    const savedGroup = await newGroup.save();
    res.status(201).json(savedGroup);
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Server error creating group", error: error.message });
  }
};

// @desc    Get all groups
// @route   GET /api/groups
// @access  Private (Admin, Coordinator)
export const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find({})
      .populate("teacher", "firstName lastName email")
      .populate("plan", "name color cost maxStudentsPerGroup")
      .populate("students", "firstName lastName email");
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ message: "Server error fetching groups", error: error.message });
  }
};

// @desc    Get a single group by ID
// @route   GET /api/groups/:id
// @access  Private (Admin, Coordinator)
export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("teacher", "firstName lastName email")
      .populate("plan", "name color cost maxStudentsPerGroup")
      .populate("students", "firstName lastName email");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    res.status(200).json(group);
  } catch (error) {
    console.error("Error fetching group by ID:", error);
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: "Invalid group ID format" });
    }
    res.status(500).json({ message: "Server error fetching group", error: error.message });
  }
};

// @desc    Update a group (add student, change comments, etc.)
// @route   PATCH /api/groups/:id
// @access  Private (Admin, Coordinator)
export const updateGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { studentId, comments, name, subject, teacher, level, plan: planId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    let updated = false;

    // Add student
    if (studentId) {
      const student = await User.findById(studentId);
      if (!student || student.role !== "student") {
        return res
          .status(400)
          .json({ message: "Invalid student ID or user is not a student" });
      }
      if (group.students.length >= group.maxStudents) {
        return res
          .status(400)
          .json({ message: "Group is full, cannot add more students" });
      }
      if (group.students.includes(studentId)) {
        return res
          .status(400)
          .json({ message: "Student already in this group" });
      }
      group.students.push(studentId);
      updated = true;
    }

    // Update comments
    if (comments !== undefined) {
      group.comments = comments;
      updated = true;
    }

    // Update name
    if (name) {
      group.name = name;
      updated = true;
    }

    // Update subject
    if (subject) {
      group.subject = subject;
      updated = true;
    }

    // Update teacher
    if (teacher) {
      const teacherUser = await User.findById(teacher);
      if (!teacherUser || teacherUser.role !== "teacher") {
        return res
          .status(400)
          .json({ message: "Invalid teacher ID or user is not a teacher" });
      }
      group.teacher = teacher;
      updated = true;
    }

    // Update level
    if (level) {
      group.level = level;
      updated = true;
    }

    // Update plan - this implies maxStudents might need to change
    if (planId) {
        const newPlan = await Plan.findById(planId);
        if (!newPlan) {
            return res.status(404).json({ message: "New plan not found" });
        }
        if (group.students.length > newPlan.maxStudentsPerGroup) {
            return res.status(400).json({ message: "Cannot change to this plan, current student count exceeds new plan's max students per group." });
        }
        group.plan = planId;
        group.maxStudents = newPlan.maxStudentsPerGroup; // Update maxStudents based on new plan
        updated = true;
    }


    if (!updated && !studentId) { // if studentId was the only thing, it's already handled
        return res.status(400).json({ message: "No update information provided" });
    }

    const updatedGroup = await group.save();
    await updatedGroup
        .populate("teacher", "firstName lastName email")
        .populate("plan", "name color cost maxStudentsPerGroup")
        .populate("students", "firstName lastName email");

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error("Error updating group:", error);
     if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: "Invalid ID format for group or other entities" });
    }
    res.status(500).json({ message: "Server error updating group", error: error.message });
  }
};

// @desc    Delete a group
// @route   DELETE /api/groups/:id
// @access  Private (Admin, Coordinator)
export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    await group.deleteOne(); // Correct method to remove the document
    res.status(200).json({ message: "Group removed successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: "Invalid group ID format" });
    }
    res.status(500).json({ message: "Server error deleting group", error: error.message });
  }
};
