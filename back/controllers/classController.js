import Class from "../models/Class.js";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import Plan from "../models/Plan.js";

// @route   POST /api/classes
// @access  admin, coordinator
export const createClass = async (req, res, next) => {
  try {
    const { meetID, recordingUrl, students, teacher, date, topic, groupe } =
      req.body;
    // 1) Basic required‑fields chog(recks
    if (!meetID) {
      return res.status(400).json({ error: "meetID is required" });
    }
    if (!Array.isArray(students) || students.length < 1) {
      return res
        .status(400)
        .json({ error: "At least one student is required" });
    }
    if (!teacher) {
      return res.status(400).json({ error: "teacher is required" });
    }
    if (!date) {
      return res.status(400).json({ error: "date is required" });
    }
    if (!topic || typeof topic !== "string" || !topic.trim()) {
      return res.status(400).json({ error: "topic is required" });
    }

    // 2) Parse & validate date
    const startsAt = new Date(date);
    if (isNaN(startsAt)) {
      return res.status(400).json({ error: "Invalid date format" });
    }
    const plan = await Plan.findById(groupe);
    // if exact match not found, fall back to 10 per student
    const cost = plan.cost;

    // 4) Create the class
    const newClass = await Class.create({
      meetID,
      cost,
      teacher,
      students,
      topic,
      date: startsAt,
      coordinator: req.user._id,
      recordingUrl: recordingUrl || null,
    });
    res.status(201).json(newClass);
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/classes
// @access  authenticated
export const listClasses = async (req, res, next) => {
  try {
    const classes = await Class.find()
      .populate("teacher", "firstName lastName")
      .populate("coordinator", "_id firstName lastName")
      .populate("students", "_id firstName lastName") // populate students array
      .populate("presentStudents", "_id firstName lastName") // populate presentStudents array
      .exec();

    res.json(classes);
  } catch (err) {
    next(err);
  }
};

export const myClasses = async (req, res, next) => {
  const { role, _id: id } = req.user;

  try {
    // build a different query depending on the user’s role
    let filter = {};
    if (role === "teacher") {
      filter = { teacher: id };
    } else if (role === "student") {
      filter = { students: id };
    } else {
      // if you have other roles, either return empty or handle accordingly
      return res.status(403).json({ message: "Access denied for this role." });
    }

    const classes = await Class.find(filter)
      .populate("teacher", "firstName lastName")
      .populate("students", "firstName lastName") // if you also want student info
      .exec();

    return res.json(classes);
  } catch (err) {
    next(err);
  }
};
export const deleteClass = async (req, res, next) => {
  const { role } = req.user;
  const classId = req.params.id;

  try {
    // 1) Only admins & coordinators can delete a class.
    if (!["admin", "coordinator"].includes(role)) {
      return res.status(403).json({ message: "Access denied for this role." });
    }
    console.log(classId);
    // 2) Fetch the class.
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ message: "Class not found." });
    }

    // 3) Find all users that have this class in their attendedClasses list.
    const users = await User.find({ attendedClasses: classId });

    // 4) For each user, find their wallet and record the change.
    await Promise.all(
      users.map(async (user) => {
        const wallet = await Wallet.findOne({ user: user._id });
        if (!wallet) {
          // Depending on your design you might want to throw here or log for diagnostic purposes.
          console.warn(
            `Wallet not found for user ${user._id}. Skipping wallet update.`
          );
          return;
        }

        // Calculate the new wallet balance. Here, we assume that deleting the class
        // refunds the class cost and that recordChange both logs the change and, if needed,
        // updates the wallet's internal balance.
        const newBalance = wallet.balance + classObj.cost;

        // Record the change. Note that we’ve replaced your unnamed parameter with an
        // explicit key 'reason' containing a description.
        await wallet.recordChange({
          newBalance,
          changedBy: req.user._id,
          reason: "unfinished session",
        });

        // Optionally, update and persist the wallet balance
        wallet.balance = newBalance;
        await wallet.save();
      })
    );

    // 5) Delete the class document.
    await classObj.deleteOne();

    // 6) Remove this classId from all users' attendedClasses.
    await User.updateMany(
      { attendedClasses: classId },
      { $pull: { attendedClasses: classId } }
    );

    return res.json({
      success: true,
      message:
        "Class deleted, removed from users' attendedClasses, and wallet changes recorded.",
    });
  } catch (err) {
    next(err);
  }
};
//TODO:
export const disapproveClass = async (req, res, next) => {};
