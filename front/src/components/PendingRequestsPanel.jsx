// src/components/PendingRequestsPanel.jsx
import React from "react";
import { Box, Text, VStack, Button } from "@chakra-ui/react";
import { useJoinRequests } from "../hooks/useJoinRequests";

export default function PendingRequestsPanel() {
  const { requests, accept, reject } = useJoinRequests();
  if (requests.length === 0) return null;

  return (
    <Box
      position="absolute"
      top="1rem"
      right="1rem"
      bg="gray.700"
      p={4}
      rounded="md"
      zIndex={10}
    >
      <Text mb={2} fontWeight="bold" color="white">
        Join requests
      </Text>
      <VStack spacing={2} align="stretch">
        {requests.map((r) => (
          <Box
            key={r.id}
            bg="gray.600"
            p={2}
            rounded="sm"
            display="flex"
            justifyContent="space-between"
          >
            <Text color="white">{r.user.name || r.user.id}</Text>
            <Box>
              <Button size="xs" mr={1} onClick={() => accept(r.id)}>
                ✓
              </Button>
              <Button size="xs" onClick={() => reject(r.id)}>
                ✕
              </Button>
            </Box>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
