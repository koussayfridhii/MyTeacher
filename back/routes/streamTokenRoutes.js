// routes/streamToken.js
import express from "express";
import passport from "passport"; // ← import passport here
import { StreamClient } from "@stream-io/node-sdk";

const router = express.Router();

const { STREAM_API_KEY, STREAM_SECRET_KEY } = process.env;
if (!STREAM_API_KEY || !STREAM_SECRET_KEY) {
  throw new Error("Stream API key or secret missing in environment");
}

const streamClient = new StreamClient(STREAM_API_KEY, STREAM_SECRET_KEY);

router.get(
  "/token",
  passport.authenticate("jwt", { session: false }), // now passport is defined
  (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const now = Math.floor(Date.now() / 1000);
      const issuedAt = now - 60;
      const expiration = now + 3600;

      const token = streamClient.createToken(userId, expiration, issuedAt);
      return res.json({ token });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
