// src/components/EndCallButton.tsx
import { Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useCall } from "@stream-io/video-react-sdk";
import { useSelector } from "react-redux";

const EndCallButton = ({ role }) => {
  const call = useCall();
  const navigate = useNavigate();
  const currentLanguage = useSelector((state) => state.language.language);

  // only owners get a button
  if (role === "student") return null;

  const endCall = async () => {
    await call.endCall();
    navigate("/dashboard");
  };

  return (
    <Button onClick={endCall} colorScheme="red" borderRadius="full">
      {currentLanguage === "fr"
        ? "Terminer l'appel pour tous"
        : currentLanguage === "ar"
        ? "إنهاء المكالمة للجميع"
        : "End call for everyone"}
    </Button>
  );
};

export default EndCallButton;
