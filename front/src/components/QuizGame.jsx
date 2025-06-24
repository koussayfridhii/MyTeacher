import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector }sfrom 'react-redux';
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
  Select,
  Progress,
} from '@chakra-ui/react';
import { translations } from '../utils/translations';

const INITIAL_TIMER_SECONDS = 20;

const QuizGame = ({ onBack }) => {
  const currentLanguage = useSelector((state) => state.language.language) || 'en';
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [quizActive, setQuizActive] = useState(false); // True when quiz is ongoing (after category selection, before results)
  const [quizEnded, setQuizEnded] = useState(false); // True when quiz is finished and results are shown
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false); // True when the answer is revealed (either by submit or time up)

  const [timeLeft, setTimeLeft] = useState(INITIAL_TIMER_SECONDS);
  const timerRef = useRef(null);

  // Fetch Categories
  useEffect(() => {
    const fetchCategoriesAsync = async () => {
      setLoadingCategories(true);
      setError(null);
      try {
        const response = await fetch('https://opentdb.com/api_category.php');
        if (!response.ok) {
            throw new Error(translations[currentLanguage]?.['quiz.error.fetchCategories'] || translations['en']['quiz.error.fetchCategories'] || 'Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data.trivia_categories || []);
      } catch (err) {
        setError(err.message); // Show specific error for categories
        toast({
          title: translations[currentLanguage]?.['quiz.toast.errorTitle'] || translations['en']['quiz.toast.errorTitle'],
          description: err.message,
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategoriesAsync();
  }, [currentLanguage, toast]);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleTimeUp = useCallback(() => {
    // This function is called when timer reaches 0
    clearTimer();
    setShowAnswer(true); // Reveal the answer
    // No score for time up if no answer was selected, or treat as wrong if an answer was selected but not submitted.
    // The current logic in handleSubmitAnswer handles scoring based on selectedAnswer.
    // If no answer selected, it will be processed as wrong by default if selectedAnswer is empty.

    // Show a toast that time is up
    toast({
      title: translations[currentLanguage]?.['quiz.timesUp'] || translations['en']['quiz.timesUp'],
      status: 'warning',
      duration: 2000,
      isClosable: true,
    });

    // We don't auto-submit here. User sees the revealed answer.
    // The "Next Question" button will handle moving forward.
    // If an answer was selected, it will be evaluated when "Next Question" is implicitly called or if we add an explicit submit on time up.
    // For simplicity, time up just reveals. User must click "Next".
  }, [clearTimer, toast, currentLanguage]);


  const startTimer = useCallback(() => {
    clearTimer();
    setTimeLeft(INITIAL_TIMER_SECONDS);
    if (quizActive && !quizEnded) { // Only start if quiz is active and not ended
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            handleTimeUp(); // Call handleTimeUp when time reaches zero
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
  }, [clearTimer, quizActive, quizEnded, handleTimeUp]);

  useEffect(() => {
    if (quizActive && !quizEnded && currentQuestionIndex < questions.length) {
      startTimer();
    } else {
      clearTimer(); // Clear timer if quiz is not active or ended
    }
    return clearTimer; // Cleanup timer on component unmount or when dependencies change
  }, [currentQuestionIndex, questions.length, quizActive, quizEnded, startTimer, clearTimer]);


  const fetchQuestions = useCallback(async () => {
    setLoadingQuestions(true);
    setError(null);
    setQuizEnded(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer('');
    setShowAnswer(false);
    setQuestions([]); // Clear previous questions

    let url = `https://opentdb.com/api.php?amount=10&type=multiple&encode=url3986`;
    if (selectedCategory) {
      url += `&category=${selectedCategory}`;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 429) {
           throw new Error(translations[currentLanguage]?.['quiz.error.rateLimit'] || translations['en']['quiz.error.rateLimit']);
        }
        throw new Error(translations[currentLanguage]?.['quiz.error.fetch'] || translations['en']['quiz.error.fetch']);
      }
      const data = await response.json();
      if (data.response_code !== 0) {
        let apiErrorMsg = translations[currentLanguage]?.['quiz.error.api'] || translations['en']['quiz.error.api'];
        if (data.response_code === 1) apiErrorMsg = translations[currentLanguage]?.['quiz.error.api.noResults'] || translations['en']['quiz.error.api.noResults'];
        if (data.response_code === 2) apiErrorMsg = translations[currentLanguage]?.['quiz.error.api.invalidParam'] || translations['en']['quiz.error.api.invalidParam'];
        throw new Error(apiErrorMsg);
      }
      const decodedQuestions = data.results.map((q) => {
        const incorrectAnswers = q.incorrect_answers.map((ans) => decodeURIComponent(ans));
        const correctAnswer = decodeURIComponent(q.correct_answer);
        const allAnswers = [...incorrectAnswers, correctAnswer].sort(() => Math.random() - 0.5);
        return {
          ...q,
          question: decodeURIComponent(q.question),
          correct_answer: correctAnswer,
          incorrect_answers: incorrectAnswers,
          all_answers: allAnswers,
        };
      });
      if (decodedQuestions.length === 0) {
        throw new Error(translations[currentLanguage]?.['quiz.error.api.noResults'] || translations['en']['quiz.error.api.noResults']);
      }
      setQuestions(decodedQuestions);
      setQuizActive(true); // Start the quiz gameplay
    } catch (err) {
      setError(err.message);
      setQuizActive(false);
    } finally {
      setLoadingQuestions(false);
    }
  }, [selectedCategory, currentLanguage, toast]);

  const handleSubmitAnswer = () => {
    if (showAnswer) return; // Don't re-submit if answer is already shown
    clearTimer();
    setShowAnswer(true);
    if (selectedAnswer === questions[currentQuestionIndex].correct_answer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    // Score has already been calculated by handleSubmitAnswer or by time up (implicitly no score if no answer)
    setShowAnswer(false);
    setSelectedAnswer('');
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Timer will be restarted by the useEffect watching currentQuestionIndex and quizActive state
    } else {
      setQuizEnded(true);
      setQuizActive(false);
    }
  };

  const handleStartQuizAttempt = () => {
    setError(null); // Clear previous errors before fetching
    fetchQuestions();
  }

  const handleQuitOrPlayAgain = () => {
    clearTimer();
    setQuizActive(false);
    setQuizEnded(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer('');
    setShowAnswer(false);
    // selectedCategory remains as is, or could be reset if desired
    setError(null);
  };

  const currentQuestion = questions[currentQuestionIndex];

  // UI for Category Selection
  if (!quizActive && !quizEnded) {
    if (loadingCategories) {
        return (
          <VStack spacing={4} align="center" justify="center" h="200px">
            <Spinner size="xl" />
            <Text>{translations[currentLanguage]?.['quiz.loading'] || translations['en']['quiz.loading']}</Text>
          </VStack>
        );
    }
    return (
      <Box p={5} boxShadow="xl" borderRadius="lg" bg="white" color="gray.700" w="full" maxW="lg" mx="auto">
        <VStack spacing={6} align="stretch">
          <Heading size="md" textAlign="center" color="primary.600">
            {translations[currentLanguage]?.['quiz.title'] || translations['en']['quiz.title']}
          </Heading>

          {error && !loadingQuestions && ( // Show error from category fetch or previous question fetch attempt
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}

          <Select
            placeholder={translations[currentLanguage]?.['quiz.selectCategory'] || translations['en']['quiz.selectCategory']}
            onChange={(e) => setSelectedCategory(e.target.value)}
            value={selectedCategory}
            isDisabled={loadingCategories || loadingQuestions || categories.length === 0}
          >
            <option value="">{translations[currentLanguage]?.['quiz.category.any'] || translations['en']['quiz.category.any']}</option>
            {categories.map(cat => (
              // Ensure category names are decoded for display
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </Select>
          <Button onClick={handleStartQuizAttempt} colorScheme="teal" isLoading={loadingQuestions} isDisabled={loadingCategories || loadingQuestions}>
            {translations[currentLanguage]?.['quiz.startQuiz'] || translations['en']['quiz.startQuiz']}
          </Button>
          {onBack && <Button onClick={onBack} variant="outline" mt={2}>{translations[currentLanguage]?.['quiz.backToDashboard'] || translations['en']['quiz.backToDashboard']}</Button>}
        </VStack>
      </Box>
    );
  }

  if (loadingQuestions) { // Loading questions specifically
    return (
      <VStack spacing={4} align="center" justify="center" h="200px">
        <Spinner size="xl" />
        <Text>{translations[currentLanguage]?.['quiz.loading'] || translations['en']['quiz.loading']}</Text>
      </VStack>
    );
  }

  if (quizEnded) {
    return (
      <VStack spacing={4} p={5} boxShadow="xl" borderRadius="lg" bg="white" color="gray.700" w="full" maxW="md" mx="auto">
        <Heading size="lg" color="primary.500">
          {translations[currentLanguage]?.['quiz.resultsTitle'] || translations['en']['quiz.resultsTitle']}
        </Heading>
        <Text fontSize="xl">
          {(translations[currentLanguage]?.['quiz.yourScoreIs'] || translations['en']['quiz.yourScoreIs'])}
          {score} / {questions.length}
        </Text>
        {questions.length > 0 && <Text fontSize="lg">({((score / questions.length) * 100).toFixed(2)}%)</Text>}
        <Button onClick={handleQuitOrPlayAgain} colorScheme="teal" size="lg">
          {translations[currentLanguage]?.['quiz.restartQuiz'] || translations['en']['quiz.restartQuiz']}
        </Button>
        {onBack && <Button onClick={onBack} variant="outline" mt={2}>{translations[currentLanguage]?.['quiz.backToDashboard'] || translations['en']['quiz.backToDashboard']}</Button>}
      </VStack>
    );
  }

  // Main Quiz UI (quizActive is true, quizEnded is false)
  if (quizActive && currentQuestion) {
    return (
      <Box p={5} boxShadow="xl" borderRadius="lg" bg="white" color="gray.700" w="full" maxW="lg" mx="auto">
        <VStack spacing={5} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading size="sm" color="primary.600" isTruncated maxW="70%">
              {selectedCategory ? categories.find(c => c.id.toString() === selectedCategory)?.name : (translations[currentLanguage]?.['quiz.category.any'] || translations['en']['quiz.category.any'])}
            </Heading>
            <Text fontSize="sm" fontWeight="bold">
              {(translations[currentLanguage]?.['quiz.score'] || translations['en']['quiz.score'])} {score}
            </Text>
          </Flex>

          <Box>
            <Text fontSize="md" fontWeight="bold" mb={2}>
              {(translations[currentLanguage]?.['quiz.question'] || translations['en']['quiz.question'])}
              {currentQuestionIndex + 1} / {questions.length}
            </Text>
            <Text fontSize="md" minH="4em" dangerouslySetInnerHTML={{ __html: currentQuestion.question }} />
          </Box>

          <Box>
            <Text fontSize="sm" mb={1} color={timeLeft <= 5 ? "red.500" : "gray.500"}>
              {(translations[currentLanguage]?.['quiz.timeRemaining'] || translations['en']['quiz.timeRemaining'])} {timeLeft}s
            </Text>
            <Progress value={timeLeft} max={INITIAL_TIMER_SECONDS} size="sm" colorScheme={timeLeft <=5 ? "red" : "teal"} borderRadius="md"/>
          </Box>

          <RadioGroup onChange={setSelectedAnswer} value={selectedAnswer} isDisabled={showAnswer || timeLeft === 0}>
            <Stack direction="column" spacing={3}>
              {currentQuestion.all_answers.map((answer, index) => (
                <Radio
                  key={index}
                  value={answer}
                  isDisabled={showAnswer || timeLeft === 0} // Disable if answer shown or time is up
                  colorScheme={showAnswer && answer === currentQuestion.correct_answer ? 'green' : (showAnswer && selectedAnswer === answer && answer !== currentQuestion.correct_answer ? 'red' : 'gray')}
                >
                  <Text dangerouslySetInnerHTML={{ __html: answer }} />
                </Radio>
              ))}
            </Stack>
          </RadioGroup>

          {showAnswer && ( // This alert shows after submit or time up
            <Alert status={(selectedAnswer === currentQuestion.correct_answer && timeLeft > 0 && selectedAnswer !== '') ? 'success' : 'error'} mt={3} fontSize="sm">
              <AlertIcon />
              {timeLeft === 0 && !selectedAnswer ? (translations[currentLanguage]?.['quiz.timesUpNoAnswer'] || translations['en']['quiz.timesUpNoAnswer']) :
               selectedAnswer === currentQuestion.correct_answer ? (translations[currentLanguage]?.['quiz.correct'] || translations['en']['quiz.correct']) :
              `${(translations[currentLanguage]?.['quiz.wrong'] || translations['en']['quiz.wrong'])} ${(translations[currentLanguage]?.['quiz.correctAnswerWas'] || translations['en']['quiz.correctAnswerWas'])} ${currentQuestion.correct_answer}`
              }
            </Alert>
          )}

          <Flex justify="space-between" mt={4} align="center">
            {!showAnswer && timeLeft > 0 ? (
              <Button
                colorScheme="blue"
                onClick={handleSubmitAnswer}
                isDisabled={!selectedAnswer}
              >
                {translations[currentLanguage]?.['quiz.submitAnswer'] || translations['en']['quiz.submitAnswer']}
              </Button>
            ) : ( // Show "Next Question" if answer is revealed or time is up
              <Button colorScheme="teal" onClick={handleNextQuestion}>
                {currentQuestionIndex === questions.length - 1
                  ? (translations[currentLanguage]?.['quiz.finishQuiz'] || translations['en']['quiz.finishQuiz'])
                  : (translations[currentLanguage]?.['quiz.nextQuestion'] || translations['en']['quiz.nextQuestion'])}
              </Button>
            )}
          </Flex>
          <Button variant="link" colorScheme="orange" size="sm" onClick={handleQuitOrPlayAgain} mt={0}>
            {translations[currentLanguage]?.['quiz.quitAndRestart'] || translations['en']['quiz.quitAndRestart']}
          </Button>
        </VStack>
      </Box>
    );
  }

  // Fallback for unexpected states or if onBack is primary action before anything loads
   return (
     <Box p={5} w="full" maxW="lg" mx="auto" textAlign="center">
        {error && <Alert status="error" mb={4}><AlertIcon />{error}</Alert>}
        <Text mb={4}>{translations[currentLanguage]?.['quiz.noQuestions'] || translations['en']['quiz.noQuestions']}</Text>
        <Button onClick={handleQuitOrPlayAgain} colorScheme="blue" mb={2}>
            {translations[currentLanguage]?.['quiz.tryAgainCategory'] || translations['en']['quiz.tryAgainCategory']}
        </Button>
        {onBack && <Button onClick={onBack} variant="solid" colorScheme="gray">{translations[currentLanguage]?.['quiz.backToDashboard'] || translations['en']['quiz.backToDashboard']}</Button>}
     </Box>
  );
};

export default QuizGame;
