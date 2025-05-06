import { useState } from "react";
import axios from "axios";

export function useScheduleMeeting(token) {
  const [loading, setLoading] = useState(false);

  // Schedule meeting via backend (private key)
  const schedule = async ({ title, start, duration }) => {
    setLoading(true);
    await axios.post(
      `${import.meta.env.VITE_API_URL}/calls/schedule`,
      { title, start, duration },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setLoading(false);
    alert("Meeting scheduled!");
  };

  return { schedule, loading };
}
