import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";

// @route   POST /api/users/create-student
// @access  Parent
export const createStudent = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const student = new User({
      email,
      password: hashed,
      role: "student",
      isVerified: true, // parent creates, so auto-verify
    });
    await student.save();

    // link to parent
    req.user.students.push(student._id);
    await req.user.save();

    // create wallet
    await Wallet.create({ user: student._id });

    res.status(201).json({ student });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/users/create-teacher
// @access  Coordinator
export const createTeacher = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const teacher = new User({
      email,
      password: hashed,
      role: "teacher",
      isVerified: true, // created by coordinator, so verified
      isApproved: true, // auto-approved when coordinator creates
    });
    await teacher.save();
    await Wallet.create({ user: teacher._id });
    res.status(201).json({ teacher });
  } catch (err) {
    next(err);
  }
};

// @route   PATCH /api/users/approve-teacher/:id
// @access  Coordinator, Admin
export const approveTeacher = async (req, res, next) => {
  try {
    const teacher = await User.findById(req.params.id);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(404).json({ error: "Teacher not found" });
    }
    teacher.isApproved = true;
    await teacher.save();
    res.json({ message: "Teacher approved", teacher });
  } catch (err) {
    next(err);
  }
};
export const myRecordings = async (req, res, next) => {
  try {
    await req.user.populate("attendedClasses").execPopulate();
    res.json({ recordings: req.user.attendedClasses });
  } catch (err) {
    next(err);
  }
};
