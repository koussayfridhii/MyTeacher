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
  Checkbox,
  Heading,
  VStack,
} from "@chakra-ui/react";

const MeetingSetup = ({ setIsSetupComplete }) => {
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived =
    callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;

  const call = useCall();

  if (!call) {
    throw new Error(
      "useStreamCall must be used within a StreamCall component."
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
          Your Meeting has not started yet. It is scheduled for{" "}
          {new Date(callStartsAt).toLocaleString()}
        </AlertTitle>
      </Alert>
    );

  if (callHasEnded)
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>The call has been ended by the host</AlertTitle>
      </Alert>
    );

  return (
    <VStack h="100vh" w="100%" justify="center" spacing={6} textAlign="center">
      <Heading size="lg">Setup</Heading>
      <Box w="100%" maxW="500px">
        <VideoPreview />
      </Box>
      <Box display="flex" alignItems="center" gap={4} color="white">
        <Checkbox
          isChecked={isMicCamToggled}
          onChange={(e) => setIsMicCamToggled(e.target.checked)}
        >
          Join with mic and camera off
        </Checkbox>
        <DeviceSettings />
      </Box>
      <Button
        colorScheme="green"
        onClick={() => {
          call.join();
          setIsSetupComplete(true);
        }}
      >
        Join meeting
      </Button>
    </VStack>
  );
};

export default MeetingSetup;
