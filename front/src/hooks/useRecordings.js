import { useState, useEffect } from "react";
import axios from "axios";

export function useRecordings(token) {
  const [recordings, setRecordings] = useState([]);

  // Fetch recordings from backend
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/recordings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRecordings(res.data.recordings));
  }, [token]);

  const downloadRecording = (id) => {
    window.open(`${import.meta.env.VITE_API_URL}/recordings/${id}`, "_blank");
  };

  return { recordings, downloadRecording };
}
