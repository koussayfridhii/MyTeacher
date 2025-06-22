import express from "express";
import {
  getLandingContent,
  updateLandingContent,
} from "../controllers/landingContentController.js";
import auth from "../middleware/auth.js";
import checkRole from "../middleware/role.js"; // Import the default export

const router = express.Router();

// Public route to get landing content
router.get("/", getLandingContent);

// Protected route to update landing content (only for admins)
router.put("/", auth, checkRole("admin"), updateLandingContent); // Use checkRole("admin")

export default router;
