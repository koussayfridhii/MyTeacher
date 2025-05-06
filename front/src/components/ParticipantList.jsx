// components/ParticipantList.jsx
import React from "react";
import { useCallStateHooks } from "@stream-io/video-react-sdk";

const ParticipantList = () => {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">Participants</h2>
      <ul className="space-y-1">
        {participants.map((participant) => (
          <li
            key={participant.user.id}
            className="p-2 rounded bg-gray-100 text-gray-800"
          >
            {participant.user.name || participant.user.id}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ParticipantList;
