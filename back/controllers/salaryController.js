import User from "../models/User.js";
import { calculateCoordinatorSalary } from "./userController.js"; // Assuming it's exported

/**
 * @desc   Get current coordinator's salary details
 * @route  GET /api/salary/me
 * @access Coordinator
 */
export const getMySalaryDetails = async (req, res, next) => {
  try {
    const coordinatorId = req.user._id;

    // Fetch the coordinator's user document
    const coordinator = await User.findById(coordinatorId).select("+base_salary +penalties"); // Ensure fields are selected

    if (!coordinator) {
      return res.status(404).json({ error: "Coordinator not found." });
    }

    if (coordinator.role !== "coordinator") {
      return res.status(403).json({ error: "User is not a coordinator." });
    }

    // Get base_salary and penalties, providing defaults if null/undefined
    const baseSalary = coordinator.base_salary || 0;
    const penalties = coordinator.penalties || 0;

    // Calculate salary details using the refactored function
    const salaryCalculationResult = await calculateCoordinatorSalary(
      coordinatorId,
      baseSalary,
      penalties
    );

    res.status(200).json({
      base_salary: baseSalary,
      penalties: penalties,
      topups_total: salaryCalculationResult.totalTopupsThisMonth,
      monthly_salary: salaryCalculationResult.finalSalary,
    });
  } catch (err) {
    next(err);
  }
};
