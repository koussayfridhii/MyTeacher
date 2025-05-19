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
    const { id: userId, amount, reason } = req.body;
    if (!userId || amount == null) {
      return res.status(400).json({ error: "userId and amount are required" });
    }
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    // record change with history
    await wallet.recordChange({
      newBalance: wallet.balance + amount,
      changedBy: req.user._id,
      reason,
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
    wallet.minimum = -minimum;
    await wallet.save();

    res.json({ wallet });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc   Get current user's wallet history and totals
 * @route  GET /api/wallet/history
 * @access Authenticated
 */
export const getWalletHistory = async (req, res, next) => {
  try {
    // find the wallet for current user
    const wallet = await Wallet.findOne({ user: req.body._id });
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    // extract history entries
    const history = wallet.history || [];

    // initialize totals
    const totals = {
      topup: 0, // total amount added via top-ups
      addClass: 0, // total points spent on classes
      bonus: 0, // total bonus points added
      freePoints: 0, // total free points awarded
    };

    // accumulate totals by reason
    history.forEach((entry) => {
      const amount = entry.newBalance - entry.oldBalance;
      const reason = entry.reason;

      switch (reason) {
        case "topup":
          totals.topup += amount;
          break;
        case "addClass":
          // deductions are stored as negative amounts
          totals.addClass += amount;
          break;
        case "bonus":
          totals.bonus += amount;
          break;
        case "free points":
          totals.freePoints += amount;
          break;
        default:
          break;
      }
    });

    // respond with history and computed totals
    res.json({
      history,
      totals,
    });
  } catch (err) {
    next(err);
  }
};
