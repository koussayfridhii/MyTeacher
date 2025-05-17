import Availability from "../models/Availability.js";
import asyncHandler from "express-async-handler";

// Utility: determine if user can access/modify a resource
const isAuthorized = (user, ownerId) =>
  ["admin", "coordinator"].includes(user.role) ||
  ownerId.toString() === user.id;

// Utility: build filter for listing
const buildFilter = (user) =>
  ["admin", "coordinator"].includes(user.role) ? {} : { user: user.id };

// Reusable: fetch and authorize availability
const fetchAvailability = async (id, user) => {
  const availability = await Availability.findById(id).populate(
    "user",
    "firstName lastName mobile email role"
  );
  if (!availability) {
    const err = new Error("Availability not found");
    err.status = 404;
    throw err;
  }
  if (!isAuthorized(user, availability.user._id)) {
    const err = new Error("Not authorized");
    err.status = 403;
    throw err;
  }
  return availability;
};

// @desc    Create availability
// @route   POST /api/availabilities
// @access  Authenticated
export const createAvailability = asyncHandler(async (req, res) => {
  const { start, end, user: userFromBody } = req.body;

  // Determine user assignment
  const assignedUser =
    ["admin", "coordinator"].includes(req.user.role) && userFromBody
      ? userFromBody
      : req.user.id;

  const availability = await Availability.create({
    user: assignedUser,
    start,
    end,
  });
  await availability.populate("user", "firstName lastName mobile email role");
  res.status(201).json({ success: true, data: availability });
});

// @desc    Get all availabilities
// @route   GET /api/availabilities
// @access  Admin or Coordinator
export const getAvailabilities = asyncHandler(async (req, res) => {
  const filter = buildFilter(req.user);
  const list = await Availability.find(filter).populate(
    "user",
    "firstName lastName mobile email role"
  );
  res.json({ success: true, data: list });
});

// @desc    Get single availability
// @route   GET /api/availabilities/:id
// @access  Owner, Admin, Coordinator
export const getAvailabilityById = asyncHandler(async (req, res) => {
  const availability = await fetchAvailability(req.params.id, req.user);
  res.json({ success: true, data: availability });
});

// @desc    Update availability
// @route   PUT /api/availabilities/:id
// @access  Owner, Admin, Coordinator
export const updateAvailability = asyncHandler(async (req, res) => {
  const availability = await fetchAvailability(req.params.id, req.user);
  const { start, end } = req.body;
  availability.start = start ?? availability.start;
  availability.end = end ?? availability.end;
  const updated = await availability.save();
  await updated.populate("user", "firstName lastName mobile email role");
  res.json({ success: true, data: updated });
});

// @desc    Delete availability
// @route   DELETE /api/availabilities/:id
// @access  Owner, Admin, Coordinator
export const deleteAvailability = asyncHandler(async (req, res) => {
  const availability = await fetchAvailability(req.params.id, req.user);
  await availability.remove();
  res.json({ success: true, message: "Availability deleted" });
});
