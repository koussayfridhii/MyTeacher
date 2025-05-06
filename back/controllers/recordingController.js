import streamClient from "../utils/streamServer.js";

// List recordings
export const listRecordings = async (req, res) => {
  try {
    const recordings = await streamClient.listRecordings();
    return res.json({ recordings });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to list recordings" });
  }
};

// Redirect to recording URL
export const getRecordingUrl = async (req, res) => {
  try {
    const { url } = await streamClient.getRecordingUrl(req.params.id);
    return res.redirect(url);
  } catch (err) {
    console.error(err);
    return res.status(404).json({ error: "Recording not found" });
  }
};
