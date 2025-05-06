import express from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import {
  createStudent,
  createTeacher,
  approveTeacher,
  myRecordings,
} from "../controllers/userController.js";

const router = express.Router();

// Parent creates student
router.post("/users/create-student", auth, role("parent"), createStudent);

// Coordinator creates teacher
router.post("/users/create-teacher", auth, role("coordinator"), createTeacher);

// Coordinator or Admin approve teacher signup
router.patch(
  "/users/approve-teacher/:id",
  auth,
  role("coordinator", "admin"),
  approveTeacher
);
router.get("/users/my-recordings", auth, role("student"), myRecordings);

export default router;
