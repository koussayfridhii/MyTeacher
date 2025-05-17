// src/components/EndCallButton.tsx
import { Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useCall } from "@stream-io/video-react-sdk";

const EndCallButton = ({ role }) => {
  const call = useCall();
  const navigate = useNavigate();

  // only owners get a button
  if (role === "student") return null;

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
