import express from "express";
import auth from "../middleware/auth.js";
import {
  listRecordings,
  getRecordingUrl,
} from "../controllers/recordingController.js";

const recordingRouter = express.Router();
// Protected routes for recordings
recordingRouter.get("/recordings/", auth, listRecordings);
recordingRouter.get("/recordings/:id", auth, getRecordingUrl);

export default recordingRouter;
