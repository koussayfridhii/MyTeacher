import Class from "../models/Class.js";

// @route   POST /api/classes
// @access  admin, coordinator
export const createClass = async (req, res, next) => {
  try {
    const { title, description, cost, recordingUrl } = req.body;
    const newClass = await Class.create({
      title,
      description,
      cost,
      recordingUrl,
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
    const classes = await Class.find();
    res.json(classes);
  } catch (err) {
    next(err);
  }
};
