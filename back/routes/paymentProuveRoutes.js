import express from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import {
  createPaymentProuve,
  getAllPaymentProuves,
  //   getPaymentProuveById,
  //   getMyPaymentProuves,
  //   updatePaymentProuve,
  deletePaymentProuve,
} from "../controllers/paymentProuveController.js";

const router = express.Router();

// Student creates a payment proof
router.post("/", auth, role("coordinator", "admin"), createPaymentProuve);

// // Student views own proofs
// router.get("/mine", auth, role("student"), getMyPaymentProuves);

// Admin/Coordinator views all proofs
router.get("/", auth, role("admin", "coordinator"), getAllPaymentProuves);

// View a single proof (any authenticated)
// router.get("/:id", auth, getPaymentProuveById);

// // Admin/Coordinator or owner can update
// router.put("/:id", auth, updatePaymentProuve);

// Admin/Coordinator can delete
router.delete("/:id", auth, role("admin"), deletePaymentProuve);

export default router;
