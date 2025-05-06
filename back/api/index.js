// api/index.js

import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import passport from "passport";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "morgan";
import serverless from "serverless-http";

// Configs & middlewares
import connectDB from "../config/db.js";
import errorHandler from "../middleware/errorHandler.js";

// Routes
import authRoutes from "../routes/authRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import walletRoutes from "../routes/walletRoutes.js";
import classRoutes from "../routes/classRoutes.js";
import callRoutes from "../routes/callRoutes.js";
import recordingRoutes from "../routes/recordingRoutes.js";
import streamTokenRoutes from "../routes/streamTokenRoutes.js";

// Initialize dotenv
dotenv.config();

// Initialize the app
const app = express();

// Logging middleware
app.use(logger("dev"));

// Body parsers & cookie parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Passport initialization
app.use(passport.initialize());
await import("../config/passport.js").then((mod) => mod.default(passport));

// CORS setup
const allowedOrigins = [
  "https://yourdomain.com",
  "http://localhost:3000",
  // Add any other allowed origins here
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Debugging incoming headers
app.use((req, res, next) => {
  console.log("Request Headers:", req.headers);
  next();
});

// Database connection (ensure you still connect if using serverless)
connectDB();
// Group your routes for better structure
const routes = {
  auth: authRoutes,
  users: userRoutes,
  wallet: walletRoutes,
  classes: classRoutes,
  calls: callRoutes,
  recordings: recordingRoutes,
  stream: streamTokenRoutes,
};

// Use routes under /api
app.use("/api/auth", routes.auth);
app.use("/api/users", routes.users);
app.use("/api/wallet", routes.wallet);
app.use("/api/classes", routes.classes);
app.use("/api/calls", routes.calls);
app.use("/api/recordings", routes.recordings);
app.use("/api/stream", routes.stream);

// Simple test route
app.get("/", (req, res) => {
  res.json("✅ Serverless Express API is running");
});

// Error handler
app.use(errorHandler);

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
// export default serverless(app);
