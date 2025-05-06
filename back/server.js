import express from "express";
import dotenv from "dotenv";
import serverless from "serverless-http";
import passport from "passport";
import cors from "cors";

// load .env
dotenv.config();

import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import callRoutes from "./routes/callRoutes.js";
import recordingRoutes from "./routes/recordingRoutes.js";
import streamTokenRouter from "./routes/streamTokenRoutes.js";

// set up express app
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(passport.initialize());
import("./config/passport.js").then((m) => m.default(passport));

// **Connect on each invocation—but cached under the hood**
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// your routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/recordings", recordingRoutes);
app.use("/api/stream", streamTokenRouter);

app.get("/", (req, res) => res.send("working !!!!"));

// error handler
app.use(errorHandler);

// **No app.listen()**
// export a single handler for Vercel
export const handler = serverless(app);
