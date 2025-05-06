import express from "express";
import auth from "../middleware/auth.js";
import {
  createInstant,
  getCallById,
  scheduleCall,
  listCalls,
} from "../controllers/CallController.js";

const callRouter = express.Router();
// Protected routes for calls
callRouter.post("/instant", auth, createInstant);
callRouter.get("/:id", auth, getCallById);
callRouter.post("/schedule", auth, scheduleCall);
callRouter.get("/", auth, listCalls);

export default callRouter;
