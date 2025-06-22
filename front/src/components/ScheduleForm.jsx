import React from "react";
import { useSelector } from "react-redux";
import { useScheduleMeeting } from "../hooks/useScheduleMeeting";
import { withAuthorization } from "../HOC/Protect";

function ScheduleForm() {
  const token = useSelector((state) => state.user.token);
  const { schedule, loading } = useScheduleMeeting(token);
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    schedule({
      title: data.get("title"),
      start: data.get("start"),
      duration: +data.get("duration"),
    });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-2 max-w-md">
      <input
        name="title"
        placeholder="Title"
        required
        className="w-full p-2 border"
      />
      <input
        name="start"
        type="datetime-local"
        required
        className="w-full p-2 border"
      />
      <input
        name="duration"
        type="number"
        placeholder="Duration (mins)"
        required
        className="w-full p-2 border"
      />
      <button
        disabled={loading}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Schedule
      </button>
    </form>
  );
}

export default withAuthorization(ScheduleForm, ["admin", "teacher", "coordinator"]);
