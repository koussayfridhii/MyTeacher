import React from 'react';
import { Box, Container, Button, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import GrammarDetectiveGame from '../components/GrammarDetectiveGame';

const GrammarDetectivePage = () => {
  return (
    <Box width="100%" py={10}>
      <Container maxW="container.lg">
        <VStack spacing={6} align="stretch">
          <Box>
            <Button as={RouterLink} to="/dashboard" colorScheme="teal" variant="outline">
              Back to Home
            </Button>
          </Box>
          <GrammarDetectiveGame />
        </VStack>
      </Container>
    </Box>
  );
};

export default GrammarDetectivePage;
