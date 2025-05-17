import express from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import {
  createAvailability,
  getAvailabilities,
  getAvailabilityById,
  updateAvailability,
  deleteAvailability,
} from "../controllers/availabiltyController.js";

const router = express.Router();

// Admin can list all availabilities
router.get("/", auth, role("admin", "coordinator"), getAvailabilities);

// Any authenticated user can list their own availabilities
router.get("/me", auth, getAvailabilities);

// Get a single availability by ID (owner or admin)
router.get("/:id", auth, getAvailabilityById);

// Create a new availability (any authenticated user)
router.post("/", auth, createAvailability);

// Update an existing availability (owner or admin)
router.put("/:id", auth, updateAvailability);

// Delete an availability (owner or admin)
router.delete("/:id", auth, deleteAvailability);

export default router;
