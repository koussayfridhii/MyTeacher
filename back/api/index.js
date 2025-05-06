// api/index.js
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

// connect to MongoDB
connectDB();

// build the app
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(passport.initialize());
await import("../config/passport.js").then((mod) => mod.default(passport));

// mount your routers
app.use("/api", [
  authRoutes,
  userRoutes,
  walletRoutes,
  classRoutes,
  callRoutes,
  recordingRoutes,
  streamTokenRouter,
]);
// app.use("/api/users", userRoutes);
// app.use("/api/wallet", walletRoutes);
// app.use("/api/classes", classRoutes);
// app.use("/api/calls", callRoutes);
// app.use("/api/recordings", recordingRoutes);
// app.use("/api/stream", streamTokenRouter);

// simple root endpoint
app.get("/", (req, res) => res.send("✅ Serverless Express on Vercel works!"));

// error middleware
app.use(errorHandler);

// **export** the handler instead of app.listen()
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
