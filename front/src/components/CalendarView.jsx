import React from "react";
import { useSelector } from "react-redux";
import { Calendar } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useCalendarEvents } from "../hooks/useCalendarEvents";

export default function CalendarView({ type }) {
  const token = useSelector((state) => state.user.token);
  const { events } = useCalendarEvents(type, token);
  return (
    <Calendar
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 600 }}
    />
  );
}
