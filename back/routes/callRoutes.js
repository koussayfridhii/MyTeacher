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
callRouter.post("/call/instant", auth, createInstant);
callRouter.get("/call/:id", auth, getCallById);
callRouter.post("/call/schedule", auth, scheduleCall);
callRouter.get("/call", auth, listCalls);

export default callRouter;
