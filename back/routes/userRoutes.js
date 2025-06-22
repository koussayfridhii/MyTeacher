import express from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import {
  myRecordings,
  addClassToUser,
  getUserClasses,
  getAllUsers,
  createUser,
  approveUser,
  deleteAttendedClass,
  getCoordinators,
  getStudents,
  updateUserByAdmin, // Import the new controller
} from "../controllers/userController.js";

const router = express.Router();

// Coordinator creates teacher and student
router.post("/create", auth, role("coordinator", "admin"), createUser);

//add class to user
router.post("/push-class", auth, addClassToUser);
router.post("/delete-class", auth, role("admin"), deleteAttendedClass);
router.get("/userClasses", auth, getUserClasses);

// Coordinator or Admin approve teacher signup
router.patch("/approve-teacher/:id", auth, role("coordinator"), approveUser);
router.patch("/approve/:id", auth, role("admin"), approveUser);
router.get("/my-recordings", auth, role("student"), myRecordings);
router.get("/", auth, role("coordinator", "admin"), getAllUsers);
router.get(
  "/coordinators",
  auth,
  role("coordinator", "admin"),
  getCoordinators
);
router.get("/students", auth, role("admin"), getStudents);

// Admin updates any user
router.patch("/:id", auth, role("admin"), updateUserByAdmin);

export default router;
