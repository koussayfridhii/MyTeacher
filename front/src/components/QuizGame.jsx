import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  Text,
  VStack,
  RadioGroup,
  Radio,
  Stack,
  Spinner,
  Alert,
  AlertIcon,
  Heading,
  useToast,
  Flex,
} from '@chakra-ui/react';
import { translations } from '../utils/translations';

const QuizGame = () => {
  const currentLanguage = useSelector((state) => state.language.language) || 'en';
  const toast = useToast();

  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [quizEnded, setQuizEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    setQuizEnded(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer('');
    setShowAnswer(false);

    try {
      const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple&encode=url3986');
      if (!response.ok) {
        throw new Error(
          translations[currentLanguage]?.['quiz.error.fetch'] ||
          translations['en']['quiz.error.fetch'] ||
          `HTTP error! status: ${response.status}`
        );
      }
      const data = await response.json();
      if (data.response_code !== 0) {
        throw new Error(
          translations[currentLanguage]?.['quiz.error.api'] ||
          translations['en']['quiz.error.api'] ||
          `API error code: ${data.response_code}`
        );
      }
      const decodedQuestions = data.results.map((q) => {
        const incorrectAnswers = q.incorrect_answers.map((ans) => decodeURIComponent(ans));
        const correctAnswer = decodeURIComponent(q.correct_answer);
        const allAnswers = [...incorrectAnswers, correctAnswer];
        // Shuffle answers
        for (let i = allAnswers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
        }
        return {
          ...q,
          question: decodeURIComponent(q.question),
          correct_answer: correctAnswer,
          incorrect_answers: incorrectAnswers,
          all_answers: allAnswers,
        };
      });
      setQuestions(decodedQuestions);
    } catch (err) {
      setError(err.message);
      toast({
        title: translations[currentLanguage]?.['quiz.toast.errorTitle'] || translations['en']['quiz.toast.errorTitle'] || "Error",
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [currentLanguage, toast]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleNextQuestion = () => {
    setShowAnswer(false);
    if (selectedAnswer === questions[currentQuestionIndex].correct_answer) {
      setScore(score + 1);
    }
    setSelectedAnswer('');
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizEnded(true);
    }
  };

  const handleRestartQuiz = () => {
    fetchQuestions();
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (loading) {
    return (
      <VStack spacing={4} align="center" justify="center" h="200px">
        <Spinner size="xl" />
        <Text>{translations[currentLanguage]?.['quiz.loading'] || translations['en']['quiz.loading'] || 'Loading Quiz...'}</Text>
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
        <Button onClick={handleRestartQuiz} ml={4}>
          {translations[currentLanguage]?.['quiz.tryAgain'] || translations['en']['quiz.tryAgain'] || 'Try Again'}
        </Button>
      </Alert>
    );
  }

  if (quizEnded) {
    return (
      <VStack spacing={4} p={5} boxShadow="md" borderRadius="lg" bg="white" color="gray.700" w="full" maxW="md" mx="auto">
        <Heading size="lg" color="primary.500">
          {translations[currentLanguage]?.['quiz.resultsTitle'] || translations['en']['quiz.resultsTitle'] || 'Quiz Results'}
        </Heading>
        <Text fontSize="xl">
          {(translations[currentLanguage]?.['quiz.yourScoreIs'] || translations['en']['quiz.yourScoreIs'] || 'Your score is: ')}
          {score} / {questions.length}
        </Text>
        <Text fontSize="lg">
          ({((score / questions.length) * 100).toFixed(2)}%)
        </Text>
        <Button onClick={handleRestartQuiz} colorScheme="teal" size="lg">
          {translations[currentLanguage]?.['quiz.restartQuiz'] || translations['en']['quiz.restartQuiz'] || 'Restart Quiz'}
        </Button>
      </VStack>
    );
  }

  if (!currentQuestion) {
    return ( // Handle case where questions might be empty after loading
      <VStack spacing={4} align="center" justify="center" h="200px">
        <Text>{translations[currentLanguage]?.['quiz.noQuestions'] || translations['en']['quiz.noQuestions'] || 'No questions available at the moment.'}</Text>
        <Button onClick={handleRestartQuiz} colorScheme="teal">
          {translations[currentLanguage]?.['quiz.tryAgain'] || translations['en']['quiz.tryAgain'] || 'Try Again'}
        </Button>
      </VStack>
    );
  }

  return (
    <Box p={5} boxShadow="xl" borderRadius="lg" bg="white" color="gray.700" w="full" maxW="lg" mx="auto">
      <VStack spacing={6} align="stretch">
        <Heading size="md" textAlign="center" color="primary.600">
          {translations[currentLanguage]?.['quiz.title'] || translations['en']['quiz.title'] || 'Trivia Quiz'}
        </Heading>
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={1}>
            {(translations[currentLanguage]?.['quiz.question'] || translations['en']['quiz.question'] || 'Question ')}
            {currentQuestionIndex + 1} / {questions.length}
          </Text>
          <Text fontSize="md" minH="3em" dangerouslySetInnerHTML={{ __html: currentQuestion.question }} />
        </Box>

        <RadioGroup onChange={setSelectedAnswer} value={selectedAnswer}>
          <Stack direction="column" spacing={3}>
            {currentQuestion.all_answers.map((answer, index) => (
              <Radio
                key={index}
                value={answer}
                isDisabled={showAnswer}
                colorScheme={showAnswer && answer === currentQuestion.correct_answer ? 'green' : 'gray'}
              >
                <Text dangerouslySetInnerHTML={{ __html: answer }} />
              </Radio>
            ))}
          </Stack>
        </RadioGroup>

        {showAnswer && (
          <Alert status={selectedAnswer === currentQuestion.correct_answer ? 'success' : 'error'} mt={3}>
            <AlertIcon />
            {selectedAnswer === currentQuestion.correct_answer
              ? (translations[currentLanguage]?.['quiz.correct'] || translations['en']['quiz.correct'] || 'Correct!')
              : `${(translations[currentLanguage]?.['quiz.wrong'] || translations['en']['quiz.wrong'] || 'Wrong!')} ${(translations[currentLanguage]?.['quiz.correctAnswerWas'] || translations['en']['quiz.correctAnswerWas'] || 'The correct answer was:')} ${currentQuestion.correct_answer}`
            }
          </Alert>
        )}

        <Flex justify="space-between" mt={4}>
          <Text fontSize="lg" fontWeight="semibold">
            {(translations[currentLanguage]?.['quiz.score'] || translations['en']['quiz.score'] || 'Score: ')} {score}
          </Text>
          {!showAnswer ? (
            <Button
              colorScheme="blue"
              onClick={() => setShowAnswer(true)}
              isDisabled={!selectedAnswer}
            >
              {translations[currentLanguage]?.['quiz.submitAnswer'] || translations['en']['quiz.submitAnswer'] || 'Submit Answer'}
            </Button>
          ) : (
            <Button colorScheme="teal" onClick={handleNextQuestion}>
              {currentQuestionIndex === questions.length - 1
                ? (translations[currentLanguage]?.['quiz.finishQuiz'] || translations['en']['quiz.finishQuiz'] || 'Finish Quiz')
                : (translations[currentLanguage]?.['quiz.nextQuestion'] || translations['en']['quiz.nextQuestion'] || 'Next Question')}
            </Button>
          )}
        </Flex>
        <Button variant="outline" onClick={handleRestartQuiz} mt={2}>
          {translations[currentLanguage]?.['quiz.restartQuiz'] || translations['en']['quiz.restartQuiz'] || 'Restart Quiz'}
        </Button>
      </VStack>
    </Box>
  );
};

export default QuizGame;
