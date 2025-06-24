import React from 'react';
import { Box, Container, Button, VStack } from '@chakra-ui/react'; // Added Button, VStack
import { useNavigate } from 'react-router-dom'; // Added useNavigate
import QuizGame from '../components/QuizGame.jsx';

const TriviaGamePage = () => {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/dashboard');
  };

  return (
    <Box width="100%" py={10}>
      <Container maxW="container.lg">
        {/* The QuizGame component itself has a "Back to Dashboard" or "Play Again" button logic.
            If a general "Back to Home" is needed outside of the game's own flow, it can be added here.
            For now, utilizing the QuizGame's onBack prop.
        */}
        <QuizGame onBack={handleBackToHome} />
      </Container>
    </Box>
  );
};

export default TriviaGamePage;
