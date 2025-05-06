import Wallet from "../models/Wallet.js";
import User from "../models/User.js";
import Class from "../models/Class.js";

/**
 * @desc   Get current user's wallet
 * @route  GET /api/wallet
 * @access Authenticated
 */
export const getMyWallet = async (req, res, next) => {
  try {
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }
    res.json({ wallet });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Add points to a user's wallet
 * @route  PATCH /api/wallet/add-points
 * @access Admin, Coordinator
 */
export const addPoints = async (req, res, next) => {
  try {
    const { userId, amount } = req.body;
    if (!userId || amount == null) {
      return res.status(400).json({ error: "userId and amount are required" });
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    wallet.balance += amount;
    await wallet.save();

    res.json({ wallet });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Student attends a class: deduct points & unlock recording
 * @route  POST /api/wallet/attend-class
 * @access Student
 */
export const attendClass = async (req, res, next) => {
  try {
    const { classId } = req.body;
    if (!classId) {
      return res.status(400).json({ error: "classId is required" });
    }

    // 1) Fetch the class to get cost & recording URL
    const klass = await Class.findById(classId);
    if (!klass) {
      return res.status(404).json({ error: "Class not found" });
    }

    // 2) Load student's wallet
    const wallet = await Wallet.findOne({ user: req.user._id });
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    if (wallet.balance < klass.cost) {
      return res.status(400).json({ error: "Insufficient points" });
    }

    // 3) Deduct cost
    wallet.balance -= klass.cost;
    await wallet.save();

    // 4) Record attendance: add class to student's profile if not already there
    const student = await User.findById(req.user._id);
    if (!student.attendedClasses.includes(classId)) {
      student.attendedClasses.push(classId);
      await student.save();
    }

    // 5) Respond with new balance and recording URL
    res.json({
      message: "Class attendance confirmed",
      balance: wallet.balance,
      recordingUrl: klass.recordingUrl,
    });
  } catch (err) {
    next(err);
  }
};
