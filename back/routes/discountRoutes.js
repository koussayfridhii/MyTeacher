import express from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import {
  createDiscount,
  updateDiscount,
  approveDiscount,
  getAllDiscounts,
  getDiscountById,
  useDiscount,
} from "../controllers/discountController.js";

const router = express.Router();

// Create a new discount (coordinator only)
router.post("/create", auth, role("coordinator"), createDiscount);

// Edit an existing discount's percent and/or maxUsage (coordinator only)
router.patch("/edit/:id", auth, role("coordinator"), updateDiscount);

// Approve or reject a discount (admin only)
router.patch("/approve/:id", auth, role("admin"), approveDiscount);

// Retrieve all discounts (authenticated users)
router.get("/", auth, getAllDiscounts);

// Retrieve a discount by student ID (authenticated users)
router.get("/:id", auth, getDiscountById);

// Use/apply a discount code (authenticated users)
router.post("/:codeId/use", auth, useDiscount);

export default router;
