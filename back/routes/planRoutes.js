import express from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import {
  createPlan,
  deletePlan,
  getPlans,
  updatePlan,
} from "../controllers/planController.js";

const router = express.Router();

// Admin can list all availabilities
router.get("/", auth, role("admin", "coordinator"), getPlans);
router.post("/", auth, role("admin"), createPlan);
router.patch("/:id", auth, role("admin"), updatePlan);
router.delete("/:id", auth, role("admin"), deletePlan);

export default router;
