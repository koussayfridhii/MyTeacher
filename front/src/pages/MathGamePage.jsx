import React from 'react';
import { Box, Container } from '@chakra-ui/react';
import MathGame from '../components/MathGame.jsx'; // Adjusted path

const MathGamePage = () => {
  return (
    <Box width="100%" py={10}>
      <Container maxW="container.lg">
        <MathGame />
      </Container>
    </Box>
  );
};

export default MathGamePage;
