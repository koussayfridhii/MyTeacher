// /api/index.js
import express from "express";
import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import cors from "cors";
import serverless from "serverless-http";

import connectDB from "../config/db.js";
import errorHandler from "../middleware/errorHandler.js";
import authRoutes from "../routes/authRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import walletRoutes from "../routes/walletRoutes.js";
import classRoutes from "../routes/classRoutes.js";
import callRoutes from "../routes/callRoutes.js";
import recordingRoutes from "../routes/recordingRoutes.js";
import streamTokenRouter from "../routes/streamTokenRoutes.js";

connectDB();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(passport.initialize());
await import("../config/passport.js").then((mod) => mod.default(passport));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/recordings", recordingRoutes);
app.use("/api/stream", streamTokenRouter);

app.get("/", (req, res) => {
  res.send("Serverless Express on Vercel is working!");
});

app.use(errorHandler);

// **THIS** is what Vercel needs:
export default serverless(app);
