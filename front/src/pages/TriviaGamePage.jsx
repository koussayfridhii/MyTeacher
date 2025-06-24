import React from 'react';
import { Box, Container } from '@chakra-ui/react';
import QuizGame from '../components/QuizGame.jsx'; // Adjusted path

const TriviaGamePage = () => {
  return (
    <Box width="100%" py={10}>
      <Container maxW="container.lg">
        <QuizGame />
      </Container>
    </Box>
  );
};

export default TriviaGamePage;
