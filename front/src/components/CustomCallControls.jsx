import React from "react";
import {
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  ScreenShareButton,
  RecordCallButton,
  CancelCallButton,
  useCall,
} from "@stream-io/video-react-sdk";
import { useIsMeetingOwner } from "../hooks/useIsMeetingOwner";
import { Flex, Button, useToast } from "@chakra-ui/react";

export default function CustomCallControls({ onLeave }) {
  const call = useCall();
  const isOwner = useIsMeetingOwner();
  const toast = useToast();

  if (!call) {
    throw new Error("useCall must be used within a StreamCall component.");
  }

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(call.id);
      toast({
        title: "Invite link copied.",
        description: `Meeting ID (${call.id}) copied to clipboard.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Failed to copy.",
        description: err?.message || "Failed to copy the invite link.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex gap={4} justifyContent="center" alignItems="center" p={4} wrap="wrap">
      <Button onClick={copyInvite} bg="primary" color="white" rounded="full">
        Invite
      </Button>
      <ToggleAudioPublishingButton />
      <ToggleVideoPublishingButton />
      <ScreenShareButton />
      {isOwner && <RecordCallButton />}
      <CancelCallButton onClick={onLeave} />
    </Flex>
  );
}
