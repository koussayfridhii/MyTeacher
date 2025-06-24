import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, VStack, HStack, Text, Button, Heading, Tag, Select, Icon, Flex, useToast } from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon, QuestionOutlineIcon } from '@chakra-ui/icons';
import { grammarGameData } from '../data/grammarDetectiveData';
import { t } from '../utils/translations'; // Assuming this is the correct path
import { languageReducer } from '../redux/languageSlice'; // For language selector

// Helper to get content based on language
const getLocalizedContent = (item, lang, field = null) => {
  if (!item) return '';
  if (field) { // If a specific field of a localized object is needed
    return item[field] ? (item[field][lang] || item[field].en) : '';
  }
  return item[lang] || item.en; // Fallback to English for simple string fields
};


const GrammarDetectiveGame = () => {
  const currentLanguage = useSelector((state) => state.language.language);
  const dispatch = useDispatch();
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [currentCategoryId, setCurrentCategoryId] = useState('');

  const [stories, setStories] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentStory, setCurrentStory] = useState(null);

  const [selectedSegments, setSelectedSegments] = useState({}); // Tracks user's active selection { segmentIndex: true }
  const [revealedErrors, setRevealedErrors] = useState({}); // { errorId: true }
  const [feedbackMessages, setFeedbackMessages] = useState([]); // Array of feedback objects {type, message, correctText}
  const [score, setScore] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  // Initialize and update categories based on language
  useEffect(() => {
    const localizedCategories = grammarGameData.categories.map(cat => ({
      id: cat.id,
      title: getLocalizedContent(cat.title, currentLanguage),
    }));
    setCategories(localizedCategories);
    if (localizedCategories.length > 0 && !currentCategoryId) {
      setCurrentCategoryId(localizedCategories[0].id);
    } else if (localizedCategories.length > 0 && currentCategoryId) {
      // Ensure currentCategory ID still exists after language change
      if (!localizedCategories.find(c => c.id === currentCategoryId)) {
        setCurrentCategoryId(localizedCategories[0].id);
      }
    }
  }, [currentLanguage, currentCategoryId]);

  // Load stories when category ID changes
  useEffect(() => {
    if (currentCategoryId) {
      const categoryData = grammarGameData.categories.find(cat => cat.id === currentCategoryId);
      if (categoryData) {
        setStories(categoryData.stories || []);
        setCurrentStoryIndex(0);
        resetStoryState();
      }
    } else {
      setStories([]);
    }
  }, [currentCategoryId, currentLanguage]); // Add currentLanguage to re-fetch/re-localize stories if needed

  // Load current story data
  useEffect(() => {
    if (stories.length > 0 && currentStoryIndex < stories.length) {
      const storyData = stories[currentStoryIndex];
      const localizedStoryContent = getLocalizedContent(storyData.content, currentLanguage) || [];

      const storyContentArray = Array.isArray(localizedStoryContent) ? localizedStoryContent : [];

      setCurrentStory({
        ...storyData,
        content: storyContentArray.map(segment => ({
          ...segment,
          // Localize segment text if it's an object like {en: "text", fr: "texte"}
          text: typeof segment.text === 'object' ? getLocalizedContent(segment.text, currentLanguage) : segment.text
        })),
        errors: (storyData.errors || []).map(err => ({
          ...err,
          incorrectPhrase: getLocalizedContent(err.incorrectPhrase, currentLanguage),
          correctPhrase: getLocalizedContent(err.correctPhrase, currentLanguage),
          explanation: getLocalizedContent(err.explanation, currentLanguage),
        })),
      });
      resetStoryState();
    } else {
      setCurrentStory(null);
      if (stories.length > 0 && currentStoryIndex >= stories.length) {
          setGameCompleted(true); // All stories in category done
      }
    }
  }, [stories, currentStoryIndex, currentLanguage]);

  const resetStoryState = () => {
    setSelectedSegments({});
    setRevealedErrors({});
    setFeedbackMessages([]);
    setGameCompleted(false);
  };

  const handleLanguageChange = (e) => {
    dispatch(languageReducer(e.target.value));
  };

  const handleCategoryChange = (event) => {
    setCurrentCategoryId(event.target.value);
    setScore(0); // Reset score when category changes
  };

  const handleSegmentClick = (segment, segmentIndex) => {
    if (revealedErrors[segment.errorId] || !segment.isError) {
      return; // Already revealed or not an error segment
    }

    const errorDefinition = currentStory.errors.find(e => e.id === segment.errorId);

    if (errorDefinition) {
      setRevealedErrors(prev => ({ ...prev, [segment.errorId]: true }));
      setScore(prevScore => prevScore + 10);
      setFeedbackMessages(prev => [...prev, {
        type: 'correct',
        messageKey: 'quiz.correct',
        explanation: errorDefinition.explanation,
        correctText: errorDefinition.correctPhrase,
        errorId: segment.errorId,
      }]);
      toast({
        title: t('quiz.correct', currentLanguage),
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } else {
      // Clicked on something not defined as an error or errorId mismatch
      setScore(prevScore => Math.max(0, prevScore - 5)); // Penalize for wrong click
      toast({
        title: t('quiz.wrong', currentLanguage),
        description: t('grammarDetective.notAnError', currentLanguage, {fallback: "That's not the error we were looking for."}),
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
    setSelectedSegments({}); // Clear selection visual immediately
  };

  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prevIndex => prevIndex + 1);
    } else {
      setGameCompleted(true);
      toast({
        title: t('quiz.resultsTitle', currentLanguage),
        description: `${t('quiz.yourScoreIs', currentLanguage)} ${score}`,
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const tryAgainCategory = () => {
    setScore(0);
    setCurrentStoryIndex(0);
    resetStoryState();
  };

  const allErrorsFound = currentStory && currentStory.errors.length > 0 && currentStory.errors.every(err => revealedErrors[err.id]);

  if (categories.length === 0) {
    return <Text p={5}>{t('quiz.loading', currentLanguage)}</Text>;
  }

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="md" width="100%" maxW="800px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Heading size="lg" textAlign="center">🕵️ {t('grammarDetective.title', currentLanguage, {fallback: "Grammar Detective"})} 🕵️‍♀️</Heading>

        <HStack justifyContent="space-between" wrap="wrap">
          <Flex direction="column" align="start">
            <Text fontWeight="bold" mb={1}>{t('grammarDetective.language', currentLanguage, {fallback: "Language"})}:</Text>
            <Select value={currentLanguage} onChange={handleLanguageChange} width="150px">
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="ar">العربية</option>
            </Select>
          </Flex>
          <Flex direction="column" align="start">
            <Text fontWeight="bold" mb={1}>{t('grammarDetective.category', currentLanguage, {fallback: "Category"})}:</Text>
            <Select value={currentCategoryId} onChange={handleCategoryChange} width="200px">
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.title}</option>
              ))}
            </Select>
          </Flex>
          <Text fontSize="2xl" fontWeight="bold" color="teal.500">{t('quiz.score', currentLanguage, {fallback: "Score:"})} {score}</Text>
        </HStack>

        {gameCompleted && stories.length > 0 && (
          <VStack spacing={3} align="center" p={4} bg="yellow.100" borderRadius="md">
            <Heading size="md">{t('grammarDetective.categoryComplete', currentLanguage, {fallback: "Category Complete!"})}</Heading>
            <Text fontSize="lg">{t('quiz.yourScoreIs', currentLanguage)} {score}</Text>
            <Button onClick={tryAgainCategory} colorScheme="teal">{t('quiz.tryAgainCategory', currentLanguage, {fallback: "Try This Category Again"})}</Button>
          </VStack>
        )}

        {!gameCompleted && currentStory ? (
          <VStack spacing={4} align="stretch" p={5} bg="gray.50" borderRadius="md" border="1px" borderColor="gray.200">
            <Heading size="md" mb={2} textAlign="center">
              {t('grammarDetective.story', currentLanguage, {fallback: "Story"})} {currentStoryIndex + 1} / {stories.length}
            </Heading>
            <Text fontSize="lg" lineHeight="tall" p={3} bg="white" borderRadius="md" borderWidth="1px" borderColor="gray.300">
              {currentStory.content.map((segment, index) => (
                <Text
                  as="span"
                  key={`${currentStory.id}-seg-${index}`}
                  bg={selectedSegments[index] ? 'yellow.200' : (revealedErrors[segment.errorId] ? 'green.100' : (segment.isError ? 'red.50' : 'transparent'))}
                  color={revealedErrors[segment.errorId] ? 'green.700' : (segment.isError && !revealedErrors[segment.errorId] ? 'red.700' : 'inherit')}
                  fontWeight={segment.isError ? 'bold' : 'normal'}
                  cursor={segment.isError && !revealedErrors[segment.errorId] ? 'pointer' : 'default'}
                  onClick={() => handleSegmentClick(segment, index)}
                  _hover={segment.isError && !revealedErrors[segment.errorId] ? { bg: 'orange.100' } : {}}
                  p={segment.isError ? 1: 0}
                  borderRadius="md"
                  mr="1" // For space between words
                >
                  {revealedErrors[segment.errorId] ? currentStory.errors.find(e=>e.id === segment.errorId)?.correctPhrase : segment.text}
                  {revealedErrors[segment.errorId] && <Icon as={CheckCircleIcon} ml={1} color="green.500" verticalAlign="middle"/>}
                </Text>
              ))}
            </Text>

            {feedbackMessages.filter(fb => revealedErrors[fb.errorId]).map((fb, idx) => (
              <Box key={`${fb.errorId}-${idx}`} mt={2} p={3} bg={'green.50'} borderRadius="md" borderWidth="1px" borderColor="green.200">
                <HStack>
                  <Icon as={CheckCircleIcon} color="green.500" />
                  <Text fontWeight="bold">{t(fb.messageKey, currentLanguage)}</Text>
                </HStack>
                <Text fontSize="sm"><b>{t('grammarDetective.explanation', currentLanguage, {fallback: "Explanation"})}:</b> {fb.explanation}</Text>
                <Text fontSize="sm"><b>{t('grammarDetective.corrected', currentLanguage, {fallback: "Corrected"})}:</b> {fb.correctText}</Text>
              </Box>
            ))}

            {allErrorsFound && (
              <Button colorScheme="blue" onClick={nextStory} mt={3} alignSelf="center">
                {currentStoryIndex < stories.length - 1 ? t('quiz.nextQuestion', currentLanguage) : t('quiz.finishQuiz', currentLanguage, {fallback: "Finish Category"})}
              </Button>
            )}
          </VStack>
        ) : (
          !gameCompleted && <Text textAlign="center" p={5}>{currentCategoryId ? t('quiz.loading', currentLanguage) : t('grammarDetective.selectCategoryPrompt', currentLanguage, {fallback: "Please select a category to start."})}</Text>
        )}
         <Button onClick={tryAgainCategory} colorScheme="orange" mt={4} isLoading={!currentStory && !gameCompleted} variant="outline">
            {t('quiz.tryAgain', currentLanguage, {fallback: "Restart Category"})}
        </Button>
      </VStack>
    </Box>
  );
};

export default GrammarDetectiveGame;
