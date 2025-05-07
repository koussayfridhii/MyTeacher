/**
 * Extracts the numeric meeting (call) ID from a Stream recording URL or path.
 * @param {string} rawUrl - full URL or path, e.g.
 *   "https://ohio.stream-io-cdn.com/1381018/video/recordings/…"
 *   or "1381018/video/recordings/…"
 * @returns {string|null} the meeting ID (e.g. "1381018") or null if not found
 */
function extractMeetingId(rawUrl) {
  try {
    // If it's a full URL, create a URL object; else treat as a pathname string
    const pathname = rawUrl.startsWith("http")
      ? new URL(rawUrl).pathname
      : rawUrl;

    // Remove any leading slash and split on "/"
    const segments = pathname.replace(/^\/+/, "").split("/");

    // The first segment should be all digits
    return /^\d+$/.test(segments[0]) ? segments[0] : null;
  } catch (err) {
    console.error("Failed to parse URL:", err);
    return null;
  }
}

// Usage example:
//   const url = "https://ohio.stream-io-cdn.com/1381018/video/recordings/default_2d023d43-72e7-48d4-a65d-bbdcea3a9774/rec_default_2d023d43-72e7-48d4-a65d-bbdcea3a9774_720p_1746493521036.mp4?Expires=1747866477&Signature=…&Key-Pair-Id=APKAIHG36VEWPDULE23Q";

//   console.log(extractMeetingId(url)); // → "1381018"

export default extractMeetingId;
