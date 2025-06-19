import express from "express";
import passport from "passport";
import "dotenv/config";
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
import discountRoutes from "./routes/discountRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import parentRoutes from "./routes/parentRoutes.js";
import potentialClientRoutes from "./routes/potenitalClientRoutes.js";
import paymentProuveRoutes from "./routes/paymentProuveRoutes.js";
connectDB();

const app = express();
const allowedOrigins = [
  "https://www.befirstlearning.com",
  "http://www.befirstlearning.com",
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
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
// app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(passport.initialize());
import("./config/passport.js").then((mod) => mod.default(passport));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/recordings", recordingRoutes);
app.use("/api/stream", streamTokenRouter);
app.use("/api/discount", discountRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/parents", parentRoutes);
app.use("/api/potential-clients", potentialClientRoutes);
app.use("/api/payment-prouve", paymentProuveRoutes);
app.get("/", (req, res) => {
  res.send("working !!!!!!!!!!!!!!!!!");
});
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`);
});
