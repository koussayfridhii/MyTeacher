import React, { useEffect, useState } from "react";
import { Box, Flex, IconButton } from "@chakra-ui/react";
import { X } from "lucide-react";
import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
  useChatClient,
} from "@stream-io/video-react-sdk";

export default function MessagingPanel({ onClose }) {
  const [channel, setChannel] = useState(null);
  const chatClient = useChatClient();
  const classId = window.location.pathname.replace("/meeting/", "");

  useEffect(() => {
    if (!chatClient) return;
    async function initChannel() {
      const ch = chatClient.channel("messaging", classId, {
        name: `Class ${classId} Chat`,
      });
      await ch.watch();
      setChannel(ch);
    }
    initChannel();
  }, [chatClient, classId]);

  if (!chatClient || !channel) {
    return <Box p={4}>Loading chat...</Box>;
  }

  return (
    <Box
      w="300px"
      bg="gray.700"
      h="full"
      p={4}
      display="flex"
      flexDirection="column"
    >
      <Flex mb={2} alignItems="center">
        <Box flexGrow={1} fontSize="lg" fontWeight="bold">
          Chat
        </Box>
        <IconButton
          icon={<X size={16} />}
          size="sm"
          onClick={onClose}
          variant="ghost"
          aria-label="Close chat"
        />
      </Flex>
      <Box flexGrow={1} mb={2} overflowY="auto">
        <Chat client={chatClient} theme="messaging light">
          <Channel
            channel={channel}
            Input={MessageInput}
            MessageList={MessageList}
          >
            <ChannelHeader />
          </Channel>
        </Chat>
      </Box>
    </Box>
  );
}
