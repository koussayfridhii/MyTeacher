import express from "express";
const router = express.Router();

import {
  createParent,
  getAllParents,
  getParentById,
  updateParent,
  deleteParent,
  addStudentToParent,
  removeStudentFromParent,
} from "../controllers/parentController.js";

import auth from "../middleware/auth.js";
import role from "../middleware/role.js";

// @route   POST /api/parents
// @desc    Create a new parent
// @access  Private (Coordinator or Admin)
router.post("/", auth, role("admin", "coordinator"), createParent);

// @route   GET /api/parents
// @desc    Get all parents
// @access  Private (Admin or Coordinator)
router.get("/", auth, role("admin", "coordinator"), getAllParents);

// @route   GET /api/parents/:id
// @desc    Get a single parent by ID
// @access  Private (Admin or Coordinator)
router.get("/:id", auth, role("admin", "coordinator"), getParentById);

// @route   PUT /api/parents/:id
// @desc    Update a parent's details
// @access  Private (Admin or Coordinator)
// Note: Specific logic for coordinator updating their own parents is in the controller
router.put("/:id", auth, role("admin", "coordinator"), updateParent);

// @route   DELETE /api/parents/:id
// @desc    Delete a parent
// @access  Private (Admin)
router.delete("/:id", auth, role(["admin"]), deleteParent);

// @route   POST /api/parents/:parentId/students
// @desc    Add a student to a parent
// @access  Private (Admin or Coordinator)
// Note: Specific logic for coordinator managing their own parents' students is in the controller
router.post(
  "/:parentId/students",
  auth,
  role("admin", "coordinator"),
  addStudentToParent
);

// @route   DELETE /api/parents/:parentId/students/:studentId
// @desc    Remove a student from a parent
// @access  Private (Admin or Coordinator)
// Note: Specific logic for coordinator managing their own parents' students is in the controller
router.delete(
  "/:parentId/students/:studentId",
  auth,
  role("admin", "coordinator"),
  removeStudentFromParent
);

export default router;
