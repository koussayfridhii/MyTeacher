import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import { sendMail } from "../utils/sendEmail.js";

// Helper: generate and send verification email
const sendVerificationEmail = async (user, res, verify = false) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  const url = `${process.env.FRONT_URL}/auth/verify/${token}`;
  const logoUrl = "https://your-cdn.com/logo.png";
  const emailHtml = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
      <div style="text-align:center;padding:20px 0;background-color:#f5f5f5;">
        <img src="${logoUrl}" alt="My Teacher Logo" style="max-height:60px;" />
      </div>
      <div style="padding:30px;">
        <h1 style="color:#004080;margin-bottom:20px;">Welcome to My Teacher!</h1>
        <p>Thanks for signing up. Please verify your email address by clicking the button below.</p>
        <p style="text-align:center;margin:30px 0;"><a href="${url}" style="background-color:#004080;color:#fff;padding:12px 24px;border-radius:4px;display:inline-block;">Verify My Email</a></p>
        <p>If the button doesn’t work, copy & paste: <a href="${url}" style="color:#004080;">${url}</a></p>
        <hr style="border:none;border-top:1px solid #eee;margin:40px 0;" />
        <p style="font-size:12px;color:#999;">© ${new Date().getFullYear()} My Teacher. All rights reserved.</p>
      </div>
    </div>
  `;
  await sendMail(
    user.email,
    "Welcome to My Teacher — Please Verify Your Email",
    emailHtml
  );
  verify
    ? res
        .status(201)
        .json({ message: "Verification email resent! Check your inbox." })
    : res
        .status(200)
        .json({
          message:
            "Signup successful! Check your email to verify your account.",
        });
};

// @route   POST /api/auth/signup
// @desc    Register user & send verification email
export const signup = async (req, res, next) => {
  try {
    const {
      "First Name": firstName,
      "Last Name": lastName,
      Email,
      "Mobile number": mobileNumber,
      Tilte: title,
      Password,
    } = req.body;

    if (await User.findOne({ email: Email.toLowerCase().trim() })) {
      return res.status(409).json({ error: "Email already in use" });
    }

    const hashed = await bcrypt.hash(Password, 10);
    const role = title.toLowerCase();

    const user = new User({
      firstName,
      lastName,
      email: Email.toLowerCase().trim(),
      password: hashed,
      mobileNumber,
      title,
      role,
    });
    await user.save();

    if (["student", "teacher"].includes(role)) {
      await Wallet.create({ user: user._id });
    }

    await sendVerificationEmail(user, res);
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Server error during signup" });
  }
};

// @route   GET /api/auth/verify/:token
// @desc    Verify user email, resend if token expired
export const verifyEmail = async (req, res, next) => {
  const { token } = req.params;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ error: "Email already verified" });

    user.isVerified = true;
    await user.save();
    return res
      .status(200)
      .json({ message: "Email verified! You can now sign in." });
  } catch (err) {
    console.error("Verification error:", err);
    if (err.name === "TokenExpiredError") {
      const decoded = jwt.decode(token);
      if (decoded && decoded.id) {
        const user = await User.findById(decoded.id);
        if (user && !user.isVerified) {
          await sendVerificationEmail(user, res, true);
          return;
        }
      }
      return res
        .status(400)
        .json({
          error: "Verification link expired. A new email has been sent.",
        });
    }
    return res
      .status(400)
      .json({ error: "Invalid token. Please sign up again." });
  }
};

// @route   POST /api/auth/signin
// @desc    Authenticate & enforce single-device session
export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    // If email not verified, send verification email again
    if (!user.isVerified) {
      await sendVerificationEmail(user, res, true);
      return; // response handled by sendVerificationEmail
    }

    if (user.role === "teacher" && !user.isApproved)
      return res.status(403).json({ error: "Teacher not approved yet" });

    if (user.currentJti) {
      return res
        .status(403)
        .json({ error: "Already signed in on another device" });
    }

    const jti = uuidv4();
    const token = jwt.sign({ id: user._id, jti }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    user.currentJti = jti;
    await user.save();

    return res.json({ token });
  } catch (err) {
    console.error("Signin error:", err);
    return res.status(500).json({ error: "Server error during signin" });
  }
};

// @route   POST /api/auth/logout
// @desc    Invalidate current session
export const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }

    await User.findByIdAndUpdate(payload.id, { currentJti: null });
    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ error: "Server error during logout" });
  }
};

// @route   GET /api/auth/profile
// @desc    Get logged-in user profile, verifying active session
export const getProfile = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const user = await User.findById(payload.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    if (payload.jti !== user.currentJti) {
      return res
        .status(401)
        .json({ error: "Session invalidated – please sign in again" });
    }

    return res.json({ user });
  } catch (err) {
    console.error("Profile error:", err);
    return res
      .status(500)
      .json({ error: "Server error during profile retrieval" });
  }
};
