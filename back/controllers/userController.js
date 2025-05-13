import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import Class from "../models/Class.js";

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

export const addClassToUser = async (req, res, next) => {
  try {
    const { classId } = req.body; // this is your meetID
    console.log(classId);
    // 1) find the Class document by meetID
    const klass = await Class.findOne({ meetID: classId });
    if (!klass) {
      return res.status(404).json({ error: "Class not found" });
    }

    // 2) load the user's wallet
    const userWallet = await Wallet.findOne({ user: req.user._id });
    if (!userWallet) {
      return res.status(400).json({ error: "Wallet not found for user." });
    }

    // 3) check if already added
    const alreadyAdded = req.user.attendedClasses.some(
      (c) => c.toString() === klass._id.toString()
    );
    if (alreadyAdded) {
      // success case: user already has the class
      await req.user.populate("attendedClasses");
      return res.json({
        message: "Class already in your list.",
        attendedClasses: req.user.attendedClasses,
        walletBalance: userWallet.balance,
      });
    }

    // 4) check minimum balance constraint
    const newBalance = userWallet.balance - klass.cost;
    if (newBalance < userWallet.minimum) {
      return res.status(400).json({
        error: `Insufficient funds: you must keep at least ${klass.minimum} in your wallet.`,
      });
    }

    // 5) deduct cost and save wallet instance
    userWallet.balance = newBalance;
    await userWallet.save();

    // 6) push the Class’s ObjectId into attendedClasses and save user
    req.user.attendedClasses.push(klass._id);
    await req.user.save();

    // 7) populate and return updated attendedClasses + wallet balance
    await req.user.populate("attendedClasses");
    res.json({
      message: "Class successfully added and cost deducted",
      attendedClasses: req.user.attendedClasses,
      walletBalance: userWallet.balance,
    });
  } catch (err) {
    next(err);
  }
};
export const getUserClasses = async (req, res, next) => {
  try {
    // req.user is populated by your auth middleware
    await req.user.populate("attendedClasses");
    res.json({ attendedClasses: req.user.attendedClasses });
  } catch (err) {
    next(err);
  }
};
