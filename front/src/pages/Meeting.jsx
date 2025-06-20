import { useState } from "react";
import { useSelector } from "react-redux";
import { StreamCall, StreamTheme } from "@stream-io/video-react-sdk";
import { useParams } from "react-router-dom";
import {
  Center,
  Spinner,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
} from "@chakra-ui/react";

import { useGetCallById } from "../hooks/useGetCallById";
import MeetingSetup from "../components/MeetingSetup";
import MeetingRoom from "../components/MeetingRoom";
import { withAuthorization } from "../HOC/Protect";

const MeetingPage = () => {
  const { id } = useParams();
  const { user } = useSelector((state) => state.user);
  const currentLanguage = useSelector((state) => state.language.language); // Get current language
  const { call, isCallLoading } = useGetCallById(id);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  if (isCallLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!call) {
    return (
      <Center h="100vh">
        <Text fontSize="3xl" fontWeight="bold" color="white">
          {currentLanguage === "fr"
            ? "Appel non trouvé"
            : currentLanguage === "ar"
            ? "لم يتم العثور على المكالمة"
            : "Call Not Found"}
        </Text>
      </Center>
    );
  }

  const notAllowed =
    call.type === "invited" &&
    (!user || !call.state.members.find((m) => m.user.id === user._id));

  if (notAllowed) {
    return (
      <Center h="100vh">
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          maxW="md"
          borderRadius="md"
          boxShadow="lg"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            {currentLanguage === "fr"
              ? "Vous n'êtes pas autorisé à rejoindre cette réunion"
              : currentLanguage === "ar"
              ? "غير مسموح لك بالانضمام إلى هذا الاجتماع"
              : "You are not allowed to join this meeting"}
          </AlertTitle>
        </Alert>
      </Center>
    );
  }

  return (
    <main style={{ height: "100vh", width: "100%" }}>
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetupComplete ? (
            <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
          ) : (
            <MeetingRoom />
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default withAuthorization(MeetingPage, [
  "admin",
  "coordinator",
  "teacher",
  "student",
]);
