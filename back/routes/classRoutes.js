import express from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import {
  createClass,
  deleteClass,
  listClasses,
  myClasses,
} from "../controllers/classController.js";

const router = express.Router();

// Anyone logged in can see available classes
router.get("/", auth, role("admin", "coordinator"), listClasses);
router.get(
  "/teacher_student",
  auth,
  role("admin", "coordinator", "teacher", "student"),
  myClasses
);

// Admin or Coordinator can create new classes
router.post("/", auth, role("admin", "coordinator", "teacher"), createClass);
router.delete("/:id", auth, role("admin", "coordinator"), deleteClass);

export default router;
