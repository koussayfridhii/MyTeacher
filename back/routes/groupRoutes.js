import express from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
} from "../controllers/groupController.js";

const router = express.Router();

// @route   POST api/groups
// @desc    Create a group
// @access  Private (Admin, Coordinator)
router.post("/", auth, role("admin", "coordinator"), createGroup);

// @route   GET api/groups
// @desc    Get all groups
// @access  Private (Admin, Coordinator)
router.get("/", auth, role("admin", "coordinator"), getAllGroups);

// @route   GET api/groups/:id
// @desc    Get group by ID
// @access  Private (Admin, Coordinator)
router.get("/:id", auth, role("admin", "coordinator"), getGroupById);

// @route   PATCH api/groups/:id
// @desc    Update a group (e.g., add student, update details)
// @access  Private (Admin, Coordinator)
router.patch("/:id", auth, role("admin", "coordinator"), updateGroup);

// @route   DELETE api/groups/:id
// @desc    Delete a group
// @access  Private (Admin, Coordinator)
router.delete("/:id", auth, role("admin", "coordinator"), deleteGroup);

export default router;
