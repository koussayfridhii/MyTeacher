// src/hooks/useJoinRequests.js
import { useEffect, useState } from "react";
import { useCall } from "@stream-io/video-react-sdk";

export function useJoinRequests() {
  const call = useCall();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    if (!call) return;
    const handler = (event) => {
      // event.type === 'permission_request' && event.permission === 'join'
      setRequests((r) => [
        ...r,
        { id: event.participant.id, user: event.participant.user },
      ]);
    };
    call.on("permission_request", handler);
    return () => {
      call.off("permission_request", handler);
    };
  }, [call]);

  const accept = async (reqId) => {
    await call.acceptParticipant(reqId);
    setRequests((r) => r.filter((x) => x.id !== reqId));
  };
  const reject = async (reqId) => {
    await call.rejectParticipant(reqId);
    setRequests((r) => r.filter((x) => x.id !== reqId));
  };

  return { requests, accept, reject };
}
