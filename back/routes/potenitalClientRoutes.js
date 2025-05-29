import express from "express";
import {
  createPotentialClient,
  assignAssistant,
  addComment,
  updateStatus,
  listPotentialClients,
  getPotentialClientById,
} from "../controllers/potentialClientController.js";
import role from "../middleware/role.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// 1. POST /api/potential-clients
// Create a new potential client
router.post("/", auth, role("admin", "coordinator"), createPotentialClient);

// 2. PATCH /api/potential-clients/:id/assistant
// Assign an assistant to a potential client
router.patch("/:id/assistant", auth, role("coordinator"), assignAssistant);

// 3. POST /api/potential-clients/:id/comment
// Add a comment to a potential client
router.post("/:id/comment", auth, addComment);

// 4. PATCH /api/potential-clients/:id/status
// Update the status of a potential client
router.patch("/:id/status", auth, updateStatus);

// 5. GET /api/potential-clients
// List all potential clients
router.get("/", auth, listPotentialClients);
router.get("/:id", auth, getPotentialClientById);

export default router;
