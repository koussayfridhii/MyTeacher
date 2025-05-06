import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/User.js";

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

export default () => {
  passport.use(
    new JwtStrategy(opts, async (payload, done) => {
      try {
        const user = await User.findById(payload.id);

        // No user or email not verified → reject
        if (!user || !user.isVerified) {
          return done(null, false);
        }

        // Teachers must also be approved
        if (user.role === "teacher" && !user.isApproved) {
          return done(null, false, { message: "Teacher not approved yet" });
        }

        // Single‐session enforcement: jti must match currentJti
        if (payload.jti !== user.currentJti) {
          return done(null, false, {
            message: "Session expired, please sign in again",
          });
        }

        // All checks passed
        return done(null, user);
      } catch (err) {
        return done(err, false);
      }
    })
  );
};
