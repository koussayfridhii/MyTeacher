import React, { useState, useEffect } from "react";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import { useGetCallById } from "../hooks/useGetCallById";
import MeetingSetup from "./MeetingSetup";
import MeetingRoom from "./MeetingRoom";
import { useSelector } from "react-redux"; // Import useSelector

export default function Instant() {
  const currentLanguage = useSelector((state) => state.language.language); // Get current language
  const token = localStorage.getItem("token");
  const [callId, setCallId] = useState(null);
  const { call, isLoading, createInstantCall, fetchCall } =
    useGetCallById(token);

  useEffect(() => {
    if (callId) fetchCall(callId, token);
  }, [callId, token, fetchCall]);
  const startInstant = async () => setCallId(await createInstantCall(token));

  if (!callId)
    return (
      <button onClick={startInstant}>
        {currentLanguage === "fr"
          ? "Démarrer une réunion instantanée"
          : currentLanguage === "ar"
          ? "بدء اجتماع فوري"
          : "Start Instant Meeting"}
      </button>
    );
  if (isLoading)
    return (
      <div>
        {currentLanguage === "fr"
          ? "Chargement de la réunion..."
          : currentLanguage === "ar"
          ? "جاري تحميل الاجتماع..."
          : "Loading meeting..."}
      </div>
    );

  return (
    <StreamCall call={call} token={token}>
      <StreamTheme>
        <MeetingSetup setReady={() => {}} />
        <MeetingRoom />
      </StreamTheme>
    </StreamCall>
  );
}
