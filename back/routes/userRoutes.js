import express from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import {
  createStudent,
  createTeacher,
  approveTeacher,
  myRecordings,
  addClassToUser,
  getUserClasses,
} from "../controllers/userController.js";

const router = express.Router();

// Parent creates student
router.post("/create-student", auth, role("parent"), createStudent);

// Coordinator creates teacher
router.post("/create-teacher", auth, role("coordinator"), createTeacher);
//add class to user
router.post("/push-class", auth, addClassToUser);
router.get("/userClasses", auth, getUserClasses);

// Coordinator or Admin approve teacher signup
router.patch(
  "/approve-teacher/:id",
  auth,
  role("coordinator", "admin"),
  approveTeacher
);
router.get("/my-recordings", auth, role("student"), myRecordings);

export default router;
