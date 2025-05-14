import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import Class from "../models/Class.js";

// @route   POST /api/users/create
// @access  Coordinator (or Admin)
export const createUser = async (req, res, next) => {
  try {
    const { email, password, role, firstName, lastName, mobileNumber, title } =
      req.body;

    // Only coordinators (or admins) can create teacher/student
    if (
      ["teacher", "student"].includes(role) &&
      req.user.role !== "coordinator" &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ error: "Insufficient permissions to create this role." });
    }

    const hashed = await bcrypt.hash(password, 10);

    const userData = {
      email,
      password: hashed,
      role,
      firstName,
      lastName,
      mobileNumber,
      title,
      // isVerified: false by default
      // isApproved: false by default for teacher/student by schema
    };

    // if coordinator is creating a teacher/student, assign them
    if (
      ["teacher", "student"].includes(role) &&
      req.user.role === "coordinator"
    ) {
      userData.coordinator = req.user._id;
      userData.isApproved = true; // optional: immediately approve
    }

    const user = new User(userData);
    await user.save();

    // create wallet for applicable roles
    await Wallet.create({ user: user._id });

    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

// @route   PATCH /api/users/approve/:id
// @access  Coordinator, Admin
export const approveUser = async (req, res, next) => {
  try {
    const { approve } = req.body;
    if (approve == null) {
      return res.status(400).json({ error: "'approve' boolean is required" });
    }

    const user = await User.findById(req.params.id);
    if (!user || !["teacher", "student"].includes(user.role)) {
      return res
        .status(404)
        .json({ error: "User not found or not approvable" });
    }

    user.isApproved = Boolean(approve);

    if (approve && !user.coordinator && req.user.role === "coordinator") {
      user.coordinator = req.user._id;
    }

    await user.save();

    res.json({
      message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} ${
        approve ? "approved" : "disapproved"
      }`,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/users/my-recordings
// @access  Authenticated User
export const myRecordings = async (req, res, next) => {
  try {
    await req.user.populate("attendedClasses");
    res.json({ recordings: req.user.attendedClasses });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/users/add-class
// @access  Authenticated User
export const addClassToUser = async (req, res, next) => {
  try {
    const { classId } = req.body;
    if (!classId) {
      return res.status(400).json({ error: "classId is required" });
    }

    const klass = await Class.findOne({ meetID: classId });
    if (!klass) {
      return res.status(404).json({ error: "Class not found" });
    }

    const userWallet = await Wallet.findOne({ user: req.user._id });
    if (!userWallet) {
      return res.status(400).json({ error: "Wallet not found for user." });
    }

    const alreadyAdded = req.user.attendedClasses.some(
      (c) => c.toString() === klass._id.toString()
    );
    if (alreadyAdded) {
      await req.user.populate("attendedClasses");
      return res.json({
        message: "Class already in your list.",
        attendedClasses: req.user.attendedClasses,
        walletBalance: userWallet.balance,
      });
    }

    const newBalance = userWallet.balance - klass.cost;
    if (newBalance < userWallet.minimum) {
      return res.status(400).json({
        error: `Insufficient funds: you must keep at least ${userWallet.minimum} in your wallet.`,
      });
    }

    await userWallet.recordChange({
      newBalance,
      changedBy: req.user._id,
      reason: "addClass",
    });

    req.user.attendedClasses.push(klass._id);
    await req.user.save();

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

// @route   GET /api/users/classes
// @access  Authenticated User
export const getUserClasses = async (req, res, next) => {
  try {
    await req.user.populate("attendedClasses");
    res.json({ attendedClasses: req.user.attendedClasses });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/users
// @access  Admin
export const getAllUsers = async (req, res, next) => {
  try {
    // populate coordinator's basic info
    const users = await User.find()
      .select("-password")
      .populate("coordinator", "firstName lastName email");

    const userIds = users.map((u) => u._id);
    const wallets = await Wallet.find({ user: { $in: userIds } });
    const walletMap = wallets.reduce((acc, w) => {
      acc[w.user.toString()] = w;
      return acc;
    }, {});

    const usersWithWallets = users.map((user) => {
      const userObj = user.toObject();
      return {
        ...userObj,
        coordinator: userObj.coordinator || null,
        wallet: walletMap[user._id.toString()] || null,
      };
    });

    res.json({ users: usersWithWallets });
  } catch (err) {
    next(err);
  }
};
