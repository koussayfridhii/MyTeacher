import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import Class from "../models/Class.js";
import { sendMail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
// Helper: generate and send verification email
const sendVerificationEmail = async (user, res, verify = false) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  const url = `${process.env.FRONT_URL}/auth/verify/${token}`;
  const logoUrl =
    "https://res.cloudinary.com/drtmtlnwi/image/upload/v1750616202/odzc3xyraampagqit6q7.png";
  const emailHtml = `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#333;">
      <div style="text-align:center;padding:20px 0;background-color:#f5f5f5;">
        <img src="${logoUrl}" alt="be first Learning Logo" style="max-height:80px;" />
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
    "Welcome to Be first learning — Please Verify Your Email",
    emailHtml
  );
  verify
    ? res
        .status(201)
        .json({ message: "Verification email resent! Check your inbox." })
    : res.status(200).json({
        message: "Signup successful! Check your email to verify your account.",
      });
};

// @route   POST /api/users/create
// @access  Coordinator or Admin
export const createUser = async (req, res, next) => {
  try {
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      mobileNumber,
      title,
      profilePic,
      subject,
      programs,
      coordinator,
      rib,
      about,
      max_hours_per_week, // New field
    } = req.body;

    // Only coordinators or admins can create teacher/student
    if (
      ["teacher", "student"].includes(role) &&
      req.user.role !== "coordinator" &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ error: "Insufficient permissions to create this role." });
    }

    const hashed = await bcrypt.hash(password, 10);

    const userData = {
      email,
      password: hashed,
      role,
      firstName,
      lastName,
      mobileNumber,
      title,
      coordinator: coordinator || null,
      rib,
      about: about || "",
      isAssigned: req.user.role === "admin",
      // default flags set by schema
    };

    // Handle profilePic if provided (e.g., URL or from file-upload middleware)
    if (profilePic) {
      userData.profilePic = profilePic;
    }

    // Assign subject and programs only for teachers
    if (role === "teacher") {
      if (subject) {
        userData.subject = subject;
      }
      if (programs) {
        userData.programs = Array.isArray(programs) ? programs : [programs];
      }
      // If admin is creating a teacher, allow setting max_hours_per_week
      if (req.user.role === "admin" && max_hours_per_week !== undefined) {
        userData.max_hours_per_week = Number(max_hours_per_week);
      }
    }

    // If coordinator is creating a teacher/student, assign them and approve
    if (
      ["teacher", "student"].includes(role) &&
      req.user.role === "coordinator"
    ) {
      userData.coordinator = req.user._id;
      userData.isApproved = true; // immediate approval by coordinator
    }

    // If admin is creating any user, auto-approve
    if (req.user.role === "admin") {
      userData.isApproved = true;
    }

    const user = new User(userData);
    await user.save();

    // create wallet for applicable roles
    await Wallet.create({ user: user._id });

    await sendVerificationEmail(user, res);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

// @route   PATCH /api/users/approve/:id
// @access  Coordinator, Admin
export const approveUser = async (req, res, next) => {
  try {
    const { approve, coordinator } = req.body;
    if (approve == null) {
      return res.status(400).json({ error: "'approve' boolean is required" });
    }

    const user = await User.findById(req.params.id);
    if (!user || !["teacher", "student"].includes(user.role)) {
      return res
        .status(404)
        .json({ error: "User not found or not approvable" });
    }

    user.isApproved = Boolean(approve);

    user.coordinator = coordinator ?? null;
    await user.save();

    res.json({
      message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} ${
        approve ? "approved" : "disapproved"
      }`,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/users/my-recordings
// @access  Authenticated User
export const myRecordings = async (req, res, next) => {
  try {
    await req.user.populate("attendedClasses");
    res.json({ recordings: req.user.attendedClasses });
  } catch (err) {
    next(err);
  }
};

// @route   POST /api/users/push-class
// @access  Authenticated User
export const addClassToUser = async (req, res, next) => {
  try {
    const { classId } = req.body;
    if (!classId) {
      return res.status(400).json({ error: "classId is required" });
    }

    // 1) Lookup class by meetID
    const klass = await Class.findOne({ meetID: classId });
    if (!klass) {
      return res.status(404).json({ error: "Class not found" });
    }

    // 2) Lookup user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 3) Early return if already in attendedClasses
    if (user.attendedClasses.some((c) => c.equals(klass._id))) {
      await user.populate({
        path: "attendedClasses",
        select: "_id topic date cost teacher",
        populate: { path: "teacher", select: "firstName lastName" },
      });
      return res.json({
        message: "Class already in your list; no funds were deducted.",
        attendedClasses: user.attendedClasses,
      });
    }

    // 4) Enrollment guard
    if (!klass.students.some((sid) => sid.equals(user._id))) {
      return res
        .status(403)
        .json({ error: "You are not enrolled in this class." });
    }

    // 5) Wallet & balance check
    const wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      return res.status(400).json({ error: "Wallet not found for user." });
    }
    const newBalance = wallet.balance - klass.cost;
    if (newBalance < wallet.minimum) {
      return res.status(400).json({
        error: `Insufficient funds: you must keep at least ${wallet.minimum} in your wallet.`,
      });
    }
    await wallet.recordChange({
      newBalance,
      changedBy: user._id,
      reason: "addClass",
    });

    // 6) Add to attendedClasses
    const userUpdate = await User.updateOne(
      { _id: user._id },
      { $addToSet: { attendedClasses: klass._id } }
    );

    // 7) If no change, bail out (shouldn’t happen due to step 3)
    if (userUpdate.modifiedCount === 0) {
      await user.populate({
        path: "attendedClasses",
        select: "_id topic date cost teacher",
        populate: { path: "teacher", select: "firstName lastName" },
      });
      return res.json({
        message: "Class already in your list; no funds were deducted.",
        attendedClasses: user.attendedClasses,
      });
    }

    // 8) Add user to presentStudents array
    await Class.updateOne(
      { _id: klass._id },
      { $addToSet: { presentStudents: user._id } }
    );

    // 9) Return updated attendedClasses
    const updatedUser = await User.findById(user._id).populate({
      path: "attendedClasses",
      select: "_id topic date cost teacher",
      populate: { path: "teacher", select: "firstName lastName" },
    });

    return res.json({
      message: "Class successfully added and cost deducted.",
      attendedClasses: updatedUser.attendedClasses,
      walletBalance: newBalance,
    });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/users/classes
// @access  Authenticated User
export const getUserClasses = async (req, res, next) => {
  try {
    await req.user.populate("attendedClasses");
    res.json({ attendedClasses: req.user.attendedClasses });
  } catch (err) {
    next(err);
  }
};

// @route   GET /api/users
// @access  Admin
export const getAllUsers = async (req, res, next) => {
  try {
    // Fetch users (excluding passwords), populate coordinator and attendedClasses → teacher
    const users = await User.find()
      .select("-password")
      .populate([
        {
          path: "coordinator",
          select: "firstName lastName email",
        },
        {
          path: "attendedClasses",
          select: "_id topic date cost teacher",
          populate: {
            path: "teacher",
            select: "firstName lastName",
          },
        },
        {
          path: "parent", // Populate the parent field
          select: "_id fullName email", // Select the fields you need from the Parent model
        },
      ]);

    // Gather all user IDs to fetch wallets in one go
    const userIds = users.map((u) => u._id);
    const wallets = await Wallet.find({ user: { $in: userIds } });

    // Build a map: userId → wallet info + computed totals
    const walletMap = wallets.reduce((acc, wallet) => {
      const history = wallet.history || [];
      const totals = {
        topup: 0,
        addClass: 0,
        bonus: 0,
        freePoints: 0,
        refund: 0,
      };

      history.forEach((entry) => {
        const amount = entry.newBalance - entry.oldBalance;
        switch (entry.reason) {
          case "topup":
            totals.topup += amount;
            break;
          case "attendClass":
          case "addClass":
            totals.addClass += amount;
            break;
          case "bonus":
            totals.bonus += amount;
            break;
          case "free points":
            totals.freePoints += amount;
            break;
          case "mistake":
            totals.topup += amount;
            break;
          case "refund":
            totals.topup += amount;
            totals.refund += amount;
            break;
          default:
            // unknown reason: ignore
            break;
        }
      });

      acc[wallet.user.toString()] = {
        balance: wallet.balance,
        minimum: wallet.minimum,
        history,
        totals,
      };
      return acc;
    }, {});

    // Merge user data + flattened attendedClasses + wallet info
    const usersWithWallets = users.map((userDoc) => {
      const user = userDoc.toObject();
      const classes = (user.attendedClasses || []).map((cls) => ({
        _id: cls._id,
        topic: cls.topic,
        date: cls.date,
        cost: cls.cost,
        teacherName: cls.teacher
          ? `${cls.teacher.firstName} ${cls.teacher.lastName}`
          : null,
      }));

      return {
        ...user,
        coordinator: user.coordinator || null,
        attendedClasses: classes,
        wallet: walletMap[user._id.toString()] || null,
      };
    });

    res.json({ users: usersWithWallets });
  } catch (err) {
    next(err);
  }
};
// @route   DELETE /api/users/attended-class
// @access  Admin
export const deleteAttendedClass = async (req, res, next) => {
  const { role } = req.user;
  const { class: attendedClassId, userId } = req.body;
  try {
    // allow only admins
    if (role !== "admin") {
      return res.status(403).json({ message: "Access denied for this role." });
    }
    if (!attendedClassId || !userId) {
      return res
        .status(400)
        .json({ message: "class id and user id are required" });
    }

    // find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // check if class exists in user's attendedClasses
    const wasAttending = user.attendedClasses.some(
      (c) => c.toString() === attendedClassId
    );
    if (!wasAttending) {
      return res
        .status(400)
        .json({ message: "Class not found in user's attended list." });
    }

    // remove the class from attendedClasses
    user.attendedClasses = user.attendedClasses.filter(
      (c) => c.toString() !== attendedClassId
    );
    const klass = await Class.findById(attendedClassId);
    // save the updated user
    await user.save();

    // decrement presentStudents count on the class
    klass.presentStudents = klass.presentStudents.filter(
      (student) => student !== user._id
    );

    return res.json({
      success: true,
      message: "Class removed successfully and student count decremented.",
      attendedClasses: user.attendedClasses,
    });
  } catch (err) {
    next(err);
  }
};

// Get all coordinators with student counts, assigned stats, and incomes (total and this month)
export const getCoordinators = async (req, res, next) => {
  try {
    // 1. Aggregate all coordinator stats without window functions
    const coordinators = await User.aggregate([
      { $match: { role: "coordinator" } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "coordinator",
          as: "students",
        },
      },
      {
        $lookup: {
          from: "wallets",
          let: { studentIds: "$students._id" },
          pipeline: [{ $match: { $expr: { $in: ["$user", "$$studentIds"] } } }],
          as: "studentWallets",
        },
      },
      {
        $addFields: {
          monthStart: {
            $dateFromParts: {
              year: { $year: "$$NOW" },
              month: { $month: "$$NOW" },
              day: 1,
            },
          },
        },
      },
      {
        $addFields: {
          studentCount: { $size: "$students" },
          studentsCreatedThisMonth: {
            $size: {
              $filter: {
                input: "$students",
                as: "stu",
                cond: { $gte: ["$$stu.createdAt", "$monthStart"] },
              },
            },
          },
          assignedCount: {
            $size: {
              $filter: {
                input: "$students",
                as: "stu",
                cond: { $eq: ["$$stu.isAssigned", true] },
              },
            },
          },
          assignedThisMonth: {
            $size: {
              $filter: {
                input: "$students",
                as: "stu",
                cond: {
                  $and: [
                    { $eq: ["$$stu.isAssigned", true] },
                    { $gte: ["$$stu.createdAt", "$monthStart"] },
                  ],
                },
              },
            },
          },
          totalIncome: {
            $sum: {
              $map: {
                input: "$studentWallets",
                as: "w",
                in: {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$$w.history",
                          as: "h",
                          cond: {
                            $in: ["$$h.reason", ["topup", "mistake", "refund"]],
                          },
                        },
                      },
                      as: "entry",
                      in: {
                        $subtract: ["$$entry.newBalance", "$$entry.oldBalance"],
                      },
                    },
                  },
                },
              },
            },
          },
          incomeThisMonth: {
            $sum: {
              $map: {
                input: "$studentWallets",
                as: "w",
                in: {
                  $sum: {
                    $map: {
                      input: {
                        $filter: {
                          input: "$$w.history",
                          as: "h",
                          cond: {
                            $and: [
                              {
                                $in: [
                                  "$$h.reason",
                                  ["topup", "mistake", "refund"],
                                ],
                              },
                              { $gte: ["$$h.createdAt", "$monthStart"] },
                            ],
                          },
                        },
                      },
                      as: "entry",
                      in: {
                        $subtract: ["$$entry.newBalance", "$$entry.oldBalance"],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          password: 0,
          __v: 0,
          students: 0,
          studentWallets: 0,
          monthStart: 0,
        },
      },
    ]);

    // 2. Assign ranking in JS for different metrics
    const assignRank = (arr, key) => {
      const sorted = [...arr].sort((a, b) => b[key] - a[key]);
      const ranks = {};
      sorted.forEach((item, idx) => {
        if (ranks[item._id.toString()] === undefined) {
          ranks[item._id.toString()] = idx + 1;
        }
      });
      return ranks;
    };

    const rankTotal = assignRank(coordinators, "totalIncome");
    const rankMonth = assignRank(coordinators, "incomeThisMonth");
    const rankStudents = assignRank(coordinators, "studentCount");
    const rankStudentsMonth = assignRank(
      coordinators,
      "studentsCreatedThisMonth"
    );
    const rankAssigned = assignRank(coordinators, "assignedCount");
    const rankAssignedMonth = assignRank(coordinators, "assignedThisMonth");

    // 3. Merge ranks into final result
    const result = coordinators.map((coord) => ({
      ...coord,
      rankTotalIncome: rankTotal[coord._id.toString()] || null,
      rankIncomeThisMonth: rankMonth[coord._id.toString()] || null,
      rankStudentCount: rankStudents[coord._id.toString()] || null,
      rankStudentsThisMonth: rankStudentsMonth[coord._id.toString()] || null,
      rankAssignedCount: rankAssigned[coord._id.toString()] || null,
      rankAssignedThisMonth: rankAssignedMonth[coord._id.toString()] || null,
    }));

    res.status(200).json({
      status: "success",
      results: result.length,
      data: { coordinators: result },
    });
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /api/users/:id
// @access  Admin
export const updateUserByAdmin = async (req, res, next) => {
  try {
    const userIdToUpdate = req.params.id;
    const updates = req.body;

    // Prevent non-admins from using this
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Insufficient permissions to update user." });
    }

    const userToUpdate = await User.findById(userIdToUpdate);
    if (!userToUpdate) {
      return res.status(404).json({ error: "User not found." });
    }

    // Fields that admin can update
    const allowedUpdates = [
      "firstName",
      "lastName",
      "email",
      "mobileNumber",
      "title",
      "role",
      "profilePic",
      "subject",
      "programs",
      "coordinator",
      "isApproved",
      "isAssigned",
      "rib",
      "about",
      "max_hours_per_week",
    ];

    // Filter updates to only allowed fields
    const filteredUpdates = Object.keys(updates)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    // Special handling for max_hours_per_week:
    // It should only be set if the user is a teacher.
    // If role is being changed FROM teacher, or if it's not a teacher, set to null.
    if (filteredUpdates.hasOwnProperty("max_hours_per_week")) {
      if (
        userToUpdate.role === "teacher" ||
        (filteredUpdates.role && filteredUpdates.role === "teacher")
      ) {
        if (
          filteredUpdates.max_hours_per_week === null ||
          filteredUpdates.max_hours_per_week === "" ||
          filteredUpdates.max_hours_per_week === undefined
        ) {
          filteredUpdates.max_hours_per_week = null;
        } else {
          filteredUpdates.max_hours_per_week = Number(
            filteredUpdates.max_hours_per_week
          );
          if (
            isNaN(filteredUpdates.max_hours_per_week) ||
            filteredUpdates.max_hours_per_week < 0
          ) {
            return res.status(400).json({
              error:
                "Invalid value for max_hours_per_week. Must be a non-negative number or null.",
            });
          }
        }
      } else {
        // If user is not a teacher, ensure max_hours_per_week is not set or is nulled
        filteredUpdates.max_hours_per_week = null;
      }
    } else if (
      userToUpdate.role !== "teacher" &&
      userToUpdate.max_hours_per_week !== null
    ) {
      // If max_hours_per_week is not in updates, but user is not a teacher, ensure it's nulled
      // This handles cases where role might be changed by the same update package
      if (
        !filteredUpdates.role ||
        (filteredUpdates.role && filteredUpdates.role !== "teacher")
      ) {
        await User.findByIdAndUpdate(
          userIdToUpdate,
          { $set: { max_hours_per_week: null } },
          { new: true, runValidators: true }
        );
      }
    }

    // If role is changed from teacher, nullify teacher-specific fields
    if (
      filteredUpdates.role &&
      filteredUpdates.role !== "teacher" &&
      userToUpdate.role === "teacher"
    ) {
      filteredUpdates.subject = null;
      filteredUpdates.programs = [];
      filteredUpdates.max_hours_per_week = null;
    }

    // Handle password update separately if provided
    if (updates.password) {
      if (updates.password.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long." });
      }
      const hashed = await bcrypt.hash(updates.password, 10);
      filteredUpdates.password = hashed;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userIdToUpdate,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found after update." });
    }

    // If the role was changed to something other than teacher, ensure max_hours_per_week is null
    if (
      updatedUser.role !== "teacher" &&
      updatedUser.max_hours_per_week !== null
    ) {
      updatedUser.max_hours_per_week = null;
      await updatedUser.save();
    }

    res
      .status(200)
      .json({ message: "User updated successfully.", user: updatedUser });
  } catch (err) {
    // Mongoose validation errors can be detailed
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
};

export const getStudents = async (req, res, next) => {
  try {
    // Total number of students
    const totalStudents = await User.countDocuments({ role: "student" });

    // Monthly breakdown of students
    const studentsPerMonth = await User.aggregate([
      {
        $match: { role: "student" },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    // Format the result
    const statsByMonth = studentsPerMonth.map((entry) => ({
      month: `${entry._id.month}/${entry._id.year}`,
      count: entry.count,
    }));

    res.status(200).json({
      success: true,
      totalStudents,
      statsByMonth,
    });
  } catch (error) {
    next(error);
  }
};
