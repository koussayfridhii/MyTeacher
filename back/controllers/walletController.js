import bcrypt from "bcryptjs";
import Wallet from "../models/Wallet.js";
import User from "../models/User.js";
import Class from "../models/Class.js";

/**
 * @desc   Get current user's wallet with history
 * @route  GET /api/wallet
 * @access Authenticated
 */
export const getMyWallet = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });
    res.json({ wallet });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Add points to a user's wallet (records history)
 * @route  PATCH /api/wallet/add-points
 * @access Admin, Coordinator
 */
export const addPoints = async (req, res, next) => {
  try {
    const { id: userId, amount } = req.body;
    if (!userId || amount == null) {
      return res.status(400).json({ error: "userId and amount are required" });
    }
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    // record change with history
    await wallet.recordChange({
      newBalance: wallet.balance + amount,
      changedBy: req.user._id,
      reason: amount > 0 ? "addPoints" : "deductPoints",
    });

    res.json({ wallet });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Student attends a class: deduct points & unlock recording (records history)
 * @route  POST /api/wallet/attend-class
 * @access Student
 */
export const attendClass = async (req, res, next) => {
  try {
    const { classId } = req.body;
    if (!classId) return res.status(400).json({ error: "classId is required" });

    const klass = await Class.findById(classId);
    if (!klass) return res.status(404).json({ error: "Class not found" });

    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    if (wallet.balance < klass.cost) {
      return res.status(400).json({ error: "Insufficient points" });
    }

    // record change
    await wallet.recordChange({
      newBalance: wallet.balance - klass.cost,
      changedBy: req.user._id,
      reason: "attendClass",
    });

    // record attendance
    const student = await User.findById(req.user._id);
    if (!student.attendedClasses.includes(classId)) {
      student.attendedClasses.push(classId);
      await student.save();
    }

    res.json({
      message: "Class attendance confirmed",
      balance: wallet.balance,
      recordingUrl: klass.recordingUrl,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Update minimum balance (records history)
 * @route  PATCH /api/wallet/set-minimum
 * @access Admin, Coordinator
 */
export const setMinimum = async (req, res, next) => {
  try {
    const { id: userId, minBalance: minimum } = req.body;
    if (!userId || minimum == null) {
      return res.status(400).json({ error: "userId and minimum are required" });
    }
    if (typeof minimum !== "number" || minimum < 0) {
      return res
        .status(400)
        .json({ error: "minimum must be a non-negative number" });
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    // record change on minimum field
    wallet.minimum = minimum;
    await wallet.save();

    res.json({ wallet });
  } catch (err) {
    next(err);
  }
};
