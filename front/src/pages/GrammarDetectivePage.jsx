import React from 'react';
import { Box, Container } from '@chakra-ui/react';
import GrammarDetectiveGame from '../components/GrammarDetectiveGame'; // Adjust path as necessary

const GrammarDetectivePage = () => {
  return (
    <Box width="100%" py={10}>
      <Container maxW="container.lg">
        <GrammarDetectiveGame />
      </Container>
    </Box>
  );
};

export default GrammarDetectivePage;
