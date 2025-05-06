import express from "express";
import passport from "passport";
import cors from "cors";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import callRoutes from "./routes/callRoutes.js";
import recordingRoutes from "./routes/recordingRoutes.js";
import streamTokenRouter from "./routes/streamTokenRoutes.js";

// connectDB();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(passport.initialize());
import("./config/passport.js").then((mod) => mod.default(passport));

// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/wallet", walletRoutes);
// app.use("/api/classes", classRoutes);
// app.use("/api/calls", callRoutes);
// app.use("/api/recordings", recordingRoutes);
// app.use("/api/stream", streamTokenRouter);
app.get("/", (req, res) => {
  res.send("working !!!!");
});
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`);
});
