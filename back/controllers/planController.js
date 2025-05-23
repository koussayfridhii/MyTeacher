import Plan from "../models/Plan.js";

export const createPlan = async (req, res, next) => {
  const { cost, numberOfStudents, color, name } = req.body;
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Insufficient permissions to create this role." });
  }
  const plan = await Plan.create({ cost, numberOfStudents, color, name });
  res.status(201).json({ success: true, plan });
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
    const updated = await Plan.findByIdAndUpdate(req.params.id, req.body, {
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
