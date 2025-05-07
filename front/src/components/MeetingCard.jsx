import React from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Image as ChakraImage,
  AvatarGroup,
  Avatar,
  useClipboard,
  useToast,
} from "@chakra-ui/react";
import { avatarImages } from "../data/sidebar";

const MeetingCard = ({
  icon,
  title,
  date,
  isPreviousMeeting = false,
  buttonIcon1,
  buttonText,
  handleClick,
  link,
}) => {
  const { onCopy } = useClipboard(link);
  const toast = useToast();
  const handleCopy = () => {
    onCopy();
    toast({
      title: "Link Copied",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Box
      bg="gray.700"
      borderRadius="14px"
      p={6}
      minH="258px"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      <Box>
        <ChakraImage src={icon} alt="meeting icon" boxSize="28px" mb={4} />
        <Flex justify="space-between">
          <Box>
            <Text fontSize="2xl" fontWeight="bold">
              {title}
            </Text>
            <Text fontSize="md" color="gray.300">
              {date}
            </Text>
          </Box>
        </Flex>
      </Box>

      <Flex align="center" justify="space-between">
        <AvatarGroup size="md" max={4} spacing={-3}>
          {avatarImages.map((src, idx) => (
            <Avatar key={idx} src={src} />
          ))}
        </AvatarGroup>
        {!isPreviousMeeting && (
          <Flex>
            <Button
              onClick={handleClick}
              leftIcon={
                buttonIcon1 ? (
                  <ChakraImage src={buttonIcon1} boxSize="20px" />
                ) : null
              }
              colorScheme="blue"
              mr={3}
              borderRadius="md"
            >
              {buttonText}
            </Button>
            <Button onClick={handleCopy} variant="outline">
              <ChakraImage src="/assets/icons/copy.svg" boxSize="20px" mr={2} />
              Copy Link
            </Button>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

export default MeetingCard;
