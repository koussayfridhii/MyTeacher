// src/components/EndCallButton.tsx
import { Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useCall } from "@stream-io/video-react-sdk";
import { useIsMeetingOwner } from "../hooks/useIsMeetingOwner";

const EndCallButton = () => {
  const call = useCall();
  const navigate = useNavigate();
  const isMeetingOwner = useIsMeetingOwner();

  // only owners get a button
  if (!isMeetingOwner) return null;

  const endCall = async () => {
    await call.endCall();
    navigate("/");
  };

  return (
    <Button onClick={endCall} colorScheme="red" borderRadius="full">
      End call for everyone
    </Button>
  );
};

export default EndCallButton;
