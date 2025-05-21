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
    const history = wallet.history || [];

    // initialize totals
    const totals = {
      topup: 0,
      addClass: 0,
      bonus: 0,
      freePoints: 0,
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

    res.json({ wallet, totals });
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
    // find the wallet for current user and populate user to access role
    const wallet = await Wallet.findOne({ user: req.user._id }).populate(
      "user"
    );
    if (!wallet) return res.status(404).json({ error: "Wallet not found" });

    // extract history entries
    const history = wallet.history || [];

    // initialize totals
    const totals = {
      topup: 0,
      addClass: 0,
      bonus: 0,
      freePoints: 0,
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

export const getAllStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = await Wallet.aggregate([
      { $unwind: "$history" },
      {
        $project: {
          reason: "$history.reason",
          amount: { $subtract: ["$history.newBalance", "$history.oldBalance"] },
          createdAt: "$history.createdAt",
          year: { $year: "$history.createdAt" },
          month: { $month: "$history.createdAt" },
          day: { $dayOfMonth: "$history.createdAt" },
        },
      },
      {
        $facet: {
          totalStats: [
            {
              $group: {
                _id: "$reason",
                total: { $sum: "$amount" },
              },
            },
          ],
          monthlyBreakdown: [
            { $match: { createdAt: { $gte: startOfYear } } },
            {
              $group: {
                _id: { month: "$month", reason: "$reason" },
                total: { $sum: "$amount" },
              },
            },
          ],
          dailyBreakdown: [
            { $match: { createdAt: { $gte: startOfMonth } } },
            {
              $group: {
                _id: { day: "$day", reason: "$reason" },
                total: { $sum: "$amount" },
              },
            },
          ],
        },
      },
    ]);

    const { totalStats, monthlyBreakdown, dailyBreakdown } = stats[0];

    // Convert totals to object and apply refund/mistake adjustment
    const formattedTotals = {};
    totalStats.forEach(({ _id, total }) => {
      formattedTotals[_id] = total;
    });

    // ✅ Adjust topup: subtract refund and mistake amounts
    formattedTotals.topup =
      (formattedTotals.topup || 0) -
      (formattedTotals.refund || 0) -
      (formattedTotals.mistake || 0);

    // Remove mistake from totals if not needed
    delete formattedTotals.mistake;

    // Format time series (monthly and daily)
    const formatTimeSeries = (arr, timeKey) => {
      const result = {};
      arr.forEach(({ _id, total }) => {
        const time = _id[timeKey];
        const reason = _id.reason;
        if (!result[time]) result[time] = {};
        result[time][reason] = total;
      });

      // Adjust topup in time series too
      Object.keys(result).forEach((key) => {
        const data = result[key];
        data.topup =
          (data.topup || 0) - (data.refund || 0) - (data.mistake || 0 || 0);
        delete data.mistake;
      });

      return result;
    };

    res.status(200).json({
      success: true,
      totals: formattedTotals,
      monthlyBreakdown: formatTimeSeries(monthlyBreakdown, "month"),
      dailyBreakdown: formatTimeSeries(dailyBreakdown, "day"),
    });
  } catch (err) {
    next(err);
  }
};
