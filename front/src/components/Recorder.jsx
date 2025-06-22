import React from "react";
import { useSelector } from "react-redux";
import { useRecordings } from "../hooks/useRecordings";
import { withAuthorization } from "../HOC/Protect";

function Recorder() {
  const token = useSelector((state) => state.user.token);
  const { recordings, downloadRecording } = useRecordings(token);
  return (
    <ul className="space-y-2">
      {recordings.map((r) => (
        <li key={r.id} className="flex justify-between">
          <span>{r.title}</span>
          <button
            onClick={() => downloadRecording(r.id)}
            className="text-blue-500"
          >
            Download
          </button>
        </li>
      ))}
    </ul>
  );
}

export default withAuthorization(Recorder, ["admin", "coordinator"]);
