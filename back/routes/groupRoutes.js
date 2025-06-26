import express from "express";
import {
  createGroup,
  getAllGroups,
  getGroupById,
  addStudentToGroup,
  removeStudentFromGroup,
  updateGroup,
  deleteGroup,
} from "../controllers/groupController.js";
import authMiddleware from "../middleware/auth.js";
import { authorizeRole } from "../middleware/role.js";

const router = express.Router();

const allowedRoles = ["admin", "coordinator"];

// @route   POST /api/groups
// @desc    Create a new group
// @access  Private (Admin, Coordinator)
router.post(
  "/",
  authMiddleware,
  authorizeRole(allowedRoles),
  createGroup
);

// @route   GET /api/groups
// @desc    Get all groups
// @access  Private (Admin, Coordinator)
router.get(
  "/",
  authMiddleware,
  authorizeRole(allowedRoles),
  getAllGroups
);

// @route   GET /api/groups/:id
// @desc    Get a single group by ID
// @access  Private (Admin, Coordinator)
router.get(
  "/:id",
  authMiddleware,
  authorizeRole(allowedRoles),
  getGroupById
);

// @route   PUT /api/groups/:id/students/add
// @desc    Add a student to a group
// @access  Private (Admin, Coordinator)
router.put(
  "/:id/students/add",
  authMiddleware,
  authorizeRole(allowedRoles),
  addStudentToGroup
);

// @route   PUT /api/groups/:id/students/remove
// @desc    Remove a student from a group
// @access  Private (Admin, Coordinator)
router.put(
  "/:id/students/remove",
  authMiddleware,
  authorizeRole(allowedRoles),
  removeStudentFromGroup
);

// @route   PUT /api/groups/:id
// @desc    Update group details
// @access  Private (Admin, Coordinator)
router.put(
  "/:id",
  authMiddleware,
  authorizeRole(allowedRoles),
  updateGroup
);

// @route   DELETE /api/groups/:id
// @desc    Delete a group
// @access  Private (Admin, Coordinator)
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole(allowedRoles),
  deleteGroup
);

export default router;
