import Class from "../models/Class.js";

// @route   POST /api/classes
// @access  admin, coordinator
export const createClass = async (req, res, next) => {
  try {
    const { meetID, recordingUrl, students, teacher, date, topic } = req.body;
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

    // 3) Tariff lookup
    const tarif = {
      1: 50,
      2: 25,
      4: 20,
      8: 12.5,
    };
    // if exact match not found, fall back to 10 per student
    const cost = tarif[students.length];

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
      .populate("teacher", "firstName lastName") // ← populate teacher
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
  const { role, _id: id } = req.user;
  const classId = req.params.id;
  try {
    // allow only admins and coordinators
    if (!["admin", "coordinator"].includes(role)) {
      return res.status(403).json({ message: "Access denied for this role." });
    }

    // fetch the class
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ message: "Class not found." });
    }

    // only allow deletion of future classes
    const now = new Date();
    if (new Date(classObj.date) <= now) {
      return res
        .status(400)
        .json({
          message: "Only classes scheduled in the future can be deleted.",
        });
    }

    // delete the class
    await classObj.deleteOne();
    return res.json({ success: true, message: "Class deleted successfully." });
  } catch (err) {
    next(err);
  }
};
