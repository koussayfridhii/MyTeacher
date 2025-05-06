import express from "express";
import auth from "../middleware/auth.js";
import role from "../middleware/role.js";
import { createClass, listClasses } from "../controllers/classController.js";

const router = express.Router();

// Anyone logged in can see available classes
router.get("/", auth, listClasses);

// Admin or Coordinator can create new classes
router.post("/", auth, role("admin", "coordinator"), createClass);

export default router;
