import { useEffect, useState } from "react";
import {
  DeviceSettings,
  VideoPreview,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Center,
  Checkbox,
  Heading,
  VStack,
} from "@chakra-ui/react";
import { useIsMeetingOwner } from "../hooks/useIsMeetingOwner";
import { useSelector } from "react-redux"; // Import useSelector

const MeetingSetup = ({ setIsSetupComplete }) => {
  const currentLanguage = useSelector((state) => state.language.language); // Get current language
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived =
    callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;

  const call = useCall();
  const isOwner = useIsMeetingOwner(); // ✅ get owner status

  if (!call) {
    throw new Error(
      currentLanguage === "fr"
        ? "useStreamCall doit être utilisé dans un composant StreamCall."
        : currentLanguage === "ar"
        ? "يجب استخدام useStreamCall ضمن مكون StreamCall."
        : "useStreamCall must be used within a StreamCall component."
    );
  }

  const [isMicCamToggled, setIsMicCamToggled] = useState(false);

  useEffect(() => {
    if (isMicCamToggled) {
      call.camera.disable();
      call.microphone.disable();
    } else {
      call.camera.enable();
      call.microphone.enable();
    }
  }, [isMicCamToggled, call.camera, call.microphone]);

  if (callTimeNotArrived)
    return (
      <Alert status="info">
        <AlertIcon />
        <AlertTitle>
          {currentLanguage === "fr"
            ? "Votre réunion n'a pas encore commencé. Elle est prévue pour "
            : currentLanguage === "ar"
            ? "اجتماعك لم يبدأ بعد. من المقرر أن يبدأ في "
            : "Your Meeting has not started yet. It is scheduled for "}
          {new Date(callStartsAt).toLocaleString()}
        </AlertTitle>
      </Alert>
    );

  if (callHasEnded)
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>
          {currentLanguage === "fr"
            ? "L'appel a été terminé par l'hôte"
            : currentLanguage === "ar"
            ? "أنهى المضيف المكالمة"
            : "The call has been ended by the host"}
        </AlertTitle>
      </Alert>
    );

  return (
    <VStack
      h="100vh"
      w={{ base: "100vw", md: "full" }}
      justify="center"
      spacing={6}
      textAlign="center"
      color={"gray.800"}
      overflow={"hidden"}
      mx={0}
    >
      <Heading size="lg">
        {currentLanguage === "fr"
          ? "Configuration"
          : currentLanguage === "ar"
          ? "الإعداد"
          : "Setup"}
      </Heading>
      <Center w="90%" maxW="500px" mx="auto">
        <VideoPreview marginX={0} />
      </Center>
      <Box display="flex" alignItems="center" gap={4} color="white" mx={0}>
        <Checkbox
          isChecked={isMicCamToggled}
          onChange={(e) => setIsMicCamToggled(e.target.checked)}
          colorScheme="blue"
          bg="gray.800"
          p={2}
          borderRadius={4}
        >
          {currentLanguage === "fr"
            ? "Rejoindre avec micro et caméra éteints"
            : currentLanguage === "ar"
            ? "الانضمام مع إيقاف تشغيل الميكروفون والكاميرا"
            : "Join with mic and camera off"}
        </Checkbox>
        <DeviceSettings />
      </Box>
      <Button
        bg="primary"
        color="white"
        onClick={() => {
          if (isOwner) {
            call.join(); // ✅ owner joins directly
          } else {
            call.join({ waitForOwnerApproval: true }); // ✅ non-owner joins in pending mode
          }
          setIsSetupComplete(true);
        }}
      >
        {currentLanguage === "fr"
          ? "Rejoindre la réunion"
          : currentLanguage === "ar"
          ? "الانضمام إلى الاجتماع"
          : "Join meeting"}
      </Button>
    </VStack>
  );
};

export default MeetingSetup;
