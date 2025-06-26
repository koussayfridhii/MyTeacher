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
import authorizeRole from "../middleware/role.js";

const router = express.Router();

// @route   POST /api/groups
// @desc    Create a new group
// @access  Private (Admin, Coordinator)
router.post(
  "/",
  authMiddleware,
  authorizeRole("admin", "coordinator"),
  createGroup
);

// @route   GET /api/groups
// @desc    Get all groups
// @access  Private (Admin, Coordinator)
router.get(
  "/",
  authMiddleware,
  authorizeRole("admin", "coordinator"),
  getAllGroups
);

// @route   GET /api/groups/:id
// @desc    Get a single group by ID
// @access  Private (Admin, Coordinator)
router.get(
  "/:id",
  authMiddleware,
  authorizeRole("admin", "coordinator"),
  getGroupById
);

// @route   PUT /api/groups/:id/students/add
// @desc    Add a student to a group
// @access  Private (Admin, Coordinator)
router.put(
  "/:id/students/add",
  authMiddleware,
  authorizeRole("admin", "coordinator"),
  addStudentToGroup
);

// @route   PUT /api/groups/:id/students/remove
// @desc    Remove a student from a group
// @access  Private (Admin, Coordinator)
router.put(
  "/:id/students/remove",
  authMiddleware,
  authorizeRole("admin", "coordinator"),
  removeStudentFromGroup
);

// @route   PUT /api/groups/:id
// @desc    Update group details
// @access  Private (Admin, Coordinator)
router.put(
  "/:id",
  authMiddleware,
  authorizeRole("admin", "coordinator"),
  updateGroup
);

// @route   DELETE /api/groups/:id
// @desc    Delete a group
// @access  Private (Admin, Coordinator)
router.delete(
  "/:id",
  authMiddleware,
  authorizeRole("admin", "coordinator"),
  deleteGroup
);

export default router;
