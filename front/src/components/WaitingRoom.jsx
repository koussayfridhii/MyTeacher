import React, { useState } from "react";
import { Text, Button, Center, Spinner } from "@chakra-ui/react";
import { useCallStateHooks, useCall } from "@stream-io/video-react-sdk";

export default function WaitingRoom() {
  const call = useCall();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const [asked, setAsked] = useState(false);

  // once joined, we return null so MeetingRoom renders
  if (callingState === "joined") {
    return null;
  }

  return (
    <Center h="100vh" flexDirection="column" gap={4}>
      {!asked ? (
        <>
          <Text color="white">You need to be admitted by the host</Text>
          <Button
            onClick={() => {
              call.requestJoin();
              setAsked(true);
            }}
            colorScheme="blue"
          >
            Request to join
          </Button>
        </>
      ) : (
        <>
          <Spinner size="xl" />
          <Text color="white">Waiting for host to admit you…</Text>
        </>
      )}
    </Center>
  );
}
