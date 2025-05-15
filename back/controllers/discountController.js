import Discount from "../models/Discount.js";

export const createDiscount = async (req, res, next) => {
  try {
    if (req.user.role !== "coordinator") {
      return res
        .status(403)
        .json({ message: "Only coordinators can create discounts." });
    }

    const { user, percent, maxUsage } = req.body;

    // Prevent creating duplicate discounts for the same student
    const existing = await Discount.findOne({ user });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Student already has a discount." });
    }

    const discount = new Discount({
      user, // this should be the student ID
      percent,
      maxUsage,
    });
    await discount.save();
    res.status(201).json(discount);
  } catch (err) {
    next(err);
  }
};

export const approveDiscount = async (req, res, next) => {
  const { approve } = req.body;
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can approve discounts." });
    }

    const { id } = req.params;
    const discount = await Discount.findById(id);
    if (!discount) {
      return res.status(404).json({ message: "Discount not found." });
    }

    discount.approved = approve;
    await discount.save();
    res.json(discount);
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing discount's percentage and/or max usage.
 * Only coordinators can edit discounts.
 */
export const updateDiscount = async (req, res, next) => {
  try {
    if (req.user.role !== "coordinator") {
      return res
        .status(403)
        .json({ message: "Only coordinators can edit discounts." });
    }

    const { id } = req.params;
    const { percent, maxUsage } = req.body;

    // Find the discount by ID
    const discount = await Discount.findById(id);
    if (!discount) {
      return res.status(404).json({ message: "Discount not found." });
    }

    // Update fields if provided
    if (percent !== undefined) discount.percent = percent;
    if (maxUsage !== undefined) discount.maxUsage = maxUsage;

    await discount.save();
    res.json(discount);
  } catch (err) {
    next(err);
  }
};

export const getAllDiscounts = async (req, res, next) => {
  try {
    const discounts = await Discount.find().populate("user", "name email");
    res.json(discounts);
  } catch (err) {
    next(err);
  }
};

export const getDiscountById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const discount = await Discount.findOne({ user: id }).populate(
      "user",
      "name email"
    );
    if (!discount) return res.status(404).json({ message: "Not found." });
    res.json(discount);
  } catch (err) {
    next(err);
  }
};

export const useDiscount = async (req, res, next) => {
  try {
    const { codeId } = req.params;
    const discount = await Discount.findById(codeId);
    if (!discount)
      return res.status(404).json({ message: "Discount not found." });
    if (!discount.approved)
      return res.status(400).json({ message: "Discount not approved." });
    if (discount.usageCount >= discount.maxUsage)
      return res.status(400).json({ message: "Max usage reached." });

    discount.usageCount += 1;
    await discount.save();
    res.json({ message: "Discount applied.", discount });
  } catch (err) {
    next(err);
  }
};
