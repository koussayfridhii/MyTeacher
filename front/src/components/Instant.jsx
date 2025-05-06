import React, { useState, useEffect } from "react";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import { useGetCallById } from "../hooks/useGetCallById";
import MeetingSetup from "./MeetingSetup";
import MeetingRoom from "./MeetingRoom";

export default function Instant() {
  const token = localStorage.getItem("token");
  const [callId, setCallId] = useState(null);
  const { call, isLoading, createInstantCall, fetchCall } =
    useGetCallById(token);

  useEffect(() => {
    if (callId) fetchCall(callId, token);
  }, [callId, token, fetchCall]);
  const startInstant = async () => setCallId(await createInstantCall(token));

  if (!callId)
    return <button onClick={startInstant}>Start Instant Meeting</button>;
  if (isLoading) return <div>Loading meeting...</div>;

  return (
    <StreamCall call={call} token={token}>
      <StreamTheme>
        <MeetingSetup setReady={() => {}} />
        <MeetingRoom />
      </StreamTheme>
    </StreamCall>
  );
}
