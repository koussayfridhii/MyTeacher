import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  Flex,
  IconButton,
  Spinner,
  FormControl,
  FormLabel,
  Select,
  useColorModeValue,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import { FiMessageSquare, FiX, FiSend, FiMic, FiVolume2 } from 'react-icons/fi'; // Example icons
import axios from 'axios'; // Import axios

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Chat settings
  const [language, setLanguage] = useState('English'); // Default language
  const [subject, setSubject] = useState('General'); // Default subject
  const [level, setLevel] = useState('Middle School'); // Default level

  const chatEndRef = useRef(null);
  const bg = useColorModeValue('gray.50', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    const chatHistoryForAPI = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));

    try {
      // Use axios for the API call
      const response = await axios.post(
        'http://localhost:5000/api/chatbot', // Explicit backend URL
        {
          message: input,
          subject,
          level,
          language,
          history: chatHistoryForAPI,
        },
        {
          // Add withCredentials if you are using cookie-based authentication
          // withCredentials: true,
          // headers: {
          //   // Add Authorization header if your route is protected by JWT in header
          //   // 'Authorization': `Bearer ${your_jwt_token}`,
          // }
        }
      );

      const botMessage = { sender: 'bot', text: response.data.reply };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (err) {
      console.error('Chatbot API error:', err);
      let errorMessageText = 'Failed to get response from the tutor.';
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessageText = err.response.data?.message || `Error: ${err.response.status} ${err.response.statusText}`;
      } else if (err.request) {
        // The request was made but no response was received
        errorMessageText = 'No response from the tutor. Is the server running?';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessageText = err.message;
      }
      setError(errorMessageText);
      const errorMessage = { sender: 'bot', text: `Error: ${errorMessageText}` };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
        // Initial greeting or prompt
        setMessages([{ sender: 'bot', text: language === 'French' ? "Bonjour ! Comment puis-je t'aider aujourd'hui ?" : language === 'Arabic' ? "مرحباً! كيف يمكنني مساعدتك اليوم؟" : "Hello! How can I help you today?"}])
    }
  };

  // Update greeting if language changes and chat is open
  useEffect(() => {
    if (isOpen && messages.length <= 1) {
         const greeting = language === 'French' ? "Bonjour ! Comment puis-je t'aider aujourd'hui ?" : language === 'Arabic' ? "مرحباً! كيف يمكنني مساعدتك اليوم؟" : "Hello! How can I help you today?"
         if (messages.length === 1 && messages[0].sender === 'bot') {
            setMessages([{sender: 'bot', text: greeting}]);
         } else if (messages.length === 0) {
            setMessages([{sender: 'bot', text: greeting}]);
         }
    }
  }, [language, isOpen]);


  if (!isOpen) {
    return (
      <Tooltip label="Ask AI Tutor" placement="left" hasArrow>
        <IconButton
          icon={<Icon as={FiMessageSquare} w={6} h={6} />}
          onClick={toggleChatbot}
          position="fixed"
          bottom="30px"
          right="30px"
          colorScheme="teal"
          isRound
          size="lg"
          boxShadow="lg"
          aria-label="Open AI Tutor"
        />
      </Tooltip>
    );
  }

  return (
    <Flex
      direction="column"
      position="fixed"
      bottom={{ base: '0', md: '30px' }}
      right={{ base: '0', md: '30px' }}
      w={{ base: '100%', md: '400px' }}
      h={{ base: '100%', md: '600px' }}
      bg={cardBg}
      boxShadow="xl"
      borderRadius={{ base: 'none', md: 'lg' }}
      zIndex="1000"
      overflow="hidden"
    >
      <Flex
        p="4"
        bg={useColorModeValue('teal.500', 'teal.700')}
        color="white"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text fontWeight="bold">AI Tutor</Text>
        <IconButton
          icon={<FiX />}
          onClick={toggleChatbot}
          size="sm"
          variant="ghost"
          color="white"
          _hover={{ bg: 'teal.600' }}
          aria-label="Close chat"
        />
      </Flex>

      <VStack spacing={2} p={3} flex="1" overflowY="auto" bg={bg}>
        <FormControl>
          <FormLabel fontSize="sm">Language</FormLabel>
          <Select value={language} onChange={(e) => setLanguage(e.target.value)} size="sm" borderColor={borderColor}>
            <option value="English">English</option>
            <option value="French">Français</option>
            <option value="Arabic">العربية</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm">Subject</FormLabel>
          <Select value={subject} onChange={(e) => setSubject(e.target.value)} size="sm" borderColor={borderColor}>
            <option value="General">General</option>
            <option value="Math">Math</option>
            <option value="Science">Science</option>
            <option value="Languages">Languages</option>
            <option value="History">History</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel fontSize="sm">Level</FormLabel>
          <Select value={level} onChange={(e) => setLevel(e.target.value)} size="sm" borderColor={borderColor}>
            <option value="Primary">Primary School</option>
            <option value="Middle School">Middle School</option>
            <option value="High School">High School</option>
          </Select>
        </FormControl>
      </VStack>

      <VStack spacing={4} p={4} flex="1" overflowY="auto" bg={bg} mt={2}>
        {messages.map((msg, index) => (
          <Flex
            key={index}
            w="full"
            justify={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
          >
            <Box
              bg={msg.sender === 'user' ? 'teal.500' : useColorModeValue('gray.200', 'gray.600')}
              color={msg.sender === 'user' ? 'white' : useColorModeValue('black', 'white')}
              px="3"
              py="2"
              borderRadius="lg"
              maxW="80%"
            >
              <Text>{msg.text}</Text>
            </Box>
          </Flex>
        ))}
        <div ref={chatEndRef} />
        {isLoading && (
          <Flex justify="center" w="full">
            <Spinner size="md" color="teal.500" />
          </Flex>
        )}
        {error && (
          <Text color="red.500" fontSize="sm" textAlign="center">
            {error}
          </Text>
        )}
      </VStack>

      <Flex p="4" borderTopWidth="1px" borderColor={borderColor} bg={cardBg}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your question..."
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          flex="1"
          mr="2"
          borderColor={borderColor}
        />
        {/* Optional: Voice input button
        <IconButton icon={<FiMic />} onClick={() => alert("Voice input not yet implemented")} mr="2" colorScheme="gray" aria-label="Voice input"/>
        */}
        <IconButton
          icon={<FiSend />}
          onClick={handleSendMessage}
          colorScheme="teal"
          aria-label="Send message"
          isLoading={isLoading}
        />
      </Flex>
    </Flex>
  );
};

export default Chatbot;
