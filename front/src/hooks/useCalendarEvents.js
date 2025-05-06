import { useState, useEffect } from "react";
import axios from "axios";

export function useCalendarEvents(type, token) {
  const [events, setEvents] = useState([]);

  // Fetch past/upcoming calls from backend
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/calls`, {
        params: { filter: type },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setEvents(
          res.data.calls.map((c) => ({
            id: c.id,
            title: c.title,
            start: new Date(c.start),
            end: new Date(c.end),
          }))
        );
      });
  }, [type, token]);

  return { events };
}
