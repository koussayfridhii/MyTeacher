import express from "express";
const router = express.Router();
import * as commentController from "../controllers/commentController.js";
import protect from "../middleware/auth.js";
import authorize from "../middleware/role.js";

// Get all comments
router.get(
  "/",
  protect,
  authorize("admin", "coordinator"),
  commentController.getAllComments
);

// Create a new comment
router.post(
  "/",
  protect,
  authorize("admin", "coordinator"),
  commentController.createComment
);

// Delete a comment
// Authorization (author or admin) is handled within the controller
router.delete("/:id", protect, commentController.deleteComment);

// Update (edit) a comment's text
// Authorization (author only) is handled within the controller
router.put("/:id", protect, commentController.updateComment);

export default router;
