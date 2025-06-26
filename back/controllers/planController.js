import Plan from "../models/Plan.js";

export const createPlan = async (req, res, next) => {
  const { cost, numberOfStudents, color, name, maxStudentsPerGroup } = req.body;
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Insufficient permissions to create this role." });
  }
  if (maxStudentsPerGroup === undefined || maxStudentsPerGroup < 1) {
    return res.status(400).json({ error: "maxStudentsPerGroup is required and must be at least 1" });
  }
  try {
    const plan = await Plan.create({ cost, numberOfStudents, color, name, maxStudentsPerGroup });
    res.status(201).json({ success: true, plan });
  } catch (err) {
    next(err);
  }
};
export const getPlans = async (req, res, next) => {
  const plans = await Plan.find();

  res.status(200).json({ success: true, plans });
};
export const updatePlan = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Insufficient permissions to update a plan." });
    }
    const { maxStudentsPerGroup } = req.body;
    if (maxStudentsPerGroup !== undefined && maxStudentsPerGroup < 1) {
      return res.status(400).json({ error: "maxStudentsPerGroup must be at least 1" });
    }
    // Ensure maxStudentsPerGroup is explicitly included if provided, or not sent if not.
    const updateData = { ...req.body };
    if (maxStudentsPerGroup === undefined) {
      delete updateData.maxStudentsPerGroup; // Avoid sending undefined if not meant to be updated
    }


    const updated = await Plan.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ error: "Plan not found." });
    }
    res.status(200).json({ success: true, plan: updated });
  } catch (err) {
    next(err);
  }
};

// Delete a plan (admin only)
export const deletePlan = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Insufficient permissions to delete a plan." });
    }
    const deleted = await Plan.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Plan not found." });
    }
    res.status(200).json({ success: true, message: "Plan deleted." });
  } catch (err) {
    next(err);
  }
};
