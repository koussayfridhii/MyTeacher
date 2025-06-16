import PaymentProuve from "../models/PaymentProuve.js";

// Create a new payment proof
export const createPaymentProuve = async (req, res) => {
  try {
    const { comment, date, method, amount, file, student } = req.body;
    const payment = await PaymentProuve.create({
      student,
      comment,
      date,
      method,
      amount,
      file,
      coordinator: req.user._id,
    });
    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all payment proofs (admin/coordinator)
export const getAllPaymentProuves = async (req, res) => {
  try {
    const payments = await PaymentProuve.find()
      .populate("student", "firstName lastName email")
      .populate("coordinator", "firstName lastName email")
      .sort({ date: -1 });
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Delete a payment proof
export const deletePaymentProuve = async (req, res) => {
  try {
    const payment = await PaymentProuve.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, error: "Not found" });
    }
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
// Get one payment proof by ID
export const getPaymentProuveById = async (req, res) => {
  try {
    const payment = await PaymentProuve.findById(req.params.id).populate(
      "student",
      "name email"
    );
    if (!payment) {
      return res.status(404).json({ success: false, error: "Not found" });
    }
    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get current student's own proofs
export const getMyPaymentProuves = async (req, res) => {
  try {
    const payments = await PaymentProuve.find({ student: req.user._id }).sort({
      date: -1,
    });
    res.json({ success: true, data: payments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update a payment proof (if needed)
export const updatePaymentProuve = async (req, res) => {
  try {
    const payment = await PaymentProuve.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!payment) {
      return res.status(404).json({ success: false, error: "Not found" });
    }
    res.json({ success: true, data: payment });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
