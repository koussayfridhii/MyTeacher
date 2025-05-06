import streamClient from "../utils/streamServer.js";

export const createInstant = async (req, res, next) => {
  try {
    const userId = req.user.id; // make sure `req.user` is populated
    const callId = `call-${Date.now()}`;
    const callType = "default";

    // Create the call
    const call = streamClient.video.call(callType, callId);
    await call.getOrCreate({
      data: {
        created_by_id: userId,
        members: [{ user_id: userId, role: "admin" }],
        custom: { label: "instant meeting" },
      },
    });

    res.status(200).json({ callId, callType });
  } catch (error) {
    next(error);
  }
};

// Fetch call by ID
export const getCallById = async (req, res, next) => {
  try {
    const { callId } = req.params; // Make sure you're passing the correct callId in the URL parameter

    // Ensure the client is initialized correctly and fetch the call
    const call = await streamClient.video.call("default", callId); // Ensure this matches your actual call setup

    const callDetails = await call.get(); // Get details of the call

    res.status(200).json(callDetails);
  } catch (error) {
    console.error(error);
    next(error);
  }
};
// Schedule a call
export const scheduleCall = async (req, res) => {
  try {
    const { title, start, duration } = req.body;
    console.log(req);
    await streamClient.createCall({
      title,
      scheduled_start_time: new Date(start),
      duration,
      createdBy: req.user.id,
    });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to schedule call" });
  }
};

// List calls (filter past/upcoming)
export const listCalls = async (req, res) => {
  console.log(req);
  try {
    const { filter } = req.query;
    const calls = await streamServer.listCalls({ filter });
    return res.json({ calls });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to list calls" });
  }
};
