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
  HStack,
} from "@chakra-ui/react";

const MeetingCard = ({
  icon,
  title,
  date,
  isPreviousMeeting = false,
  buttonIcon1,
  buttonText,
  handleClick,
  link,
  teacher,
  students,
  role,
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
      color="white"
    >
      <Box>
        <ChakraImage src={icon} alt="meeting icon" boxSize="28px" mb={4} />
        <Flex justify="space-between">
          <Box>
            <Text fontSize="2xl" fontWeight="bold">
              {title}
            </Text>
            <Text fontSize="xl" fontWeight="bold">
              teacher : {teacher}
            </Text>
            <Text fontSize="md" color="gray.300">
              {date}
            </Text>
            <HStack>
              <Text fontSize="md" fontWeight="bold" color="gray.300">
                {students}
              </Text>
              <Text fontSize="md" color="gray.300">
                students
              </Text>
            </HStack>
          </Box>
        </Flex>
      </Box>

      <Flex align="center" justify="space-between">
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
            {(role === "coordinator" || role === "admin") && (
              <Button onClick={handleCopy} variant="outline" colorScheme="blue">
                <ChakraImage
                  src="/assets/icons/copy.svg"
                  boxSize="20px"
                  mr={2}
                />
                Copy Link
              </Button>
            )}
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

export default MeetingCard;
