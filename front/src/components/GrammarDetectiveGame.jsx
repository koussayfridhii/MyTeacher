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

  const [selectedSegments, setSelectedSegments] = useState({}); // For brief hover/click highlight if still desired, but userSelections is main
  const [revealedErrors, setRevealedErrors] = useState({}); // { errorId: true } - Populated after submission for correct ones
  const [userSelections, setUserSelections] = useState({}); // { segmentIndex: true } for words user *thinks* are errors
  const [storySubmitted, setStorySubmitted] = useState(false); // Has the current story's response been submitted?
  const [feedbackMessages, setFeedbackMessages] = useState([]); // Array of feedback objects {type, message, correctText} - Populated after submission
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
    setSelectedSegments({}); // For brief click visual if any
    setRevealedErrors({});   // Errors confirmed by submission
    setUserSelections({});   // User's current picks for the story
    setStorySubmitted(false); // Reset submission state
    setFeedbackMessages([]); // Clear old feedback
    // setGameCompleted(false); // This is more for end of category, not individual story reset
  };

  const handleLanguageChange = (e) => {
    dispatch(languageReducer(e.target.value));
  };

  const handleCategoryChange = (event) => {
    setCurrentCategoryId(event.target.value);
    setScore(0);
    setGameCompleted(false); // Reset game completion when category changes
    // resetStoryState() will be called by useEffect due to currentCategoryId change if stories are loaded
  };

  const handleSegmentClick = (segment, segmentIndex) => {
    if (storySubmitted) return; // Don't allow changes after submission

    // Briefly highlight the clicked segment for immediate feedback
    setSelectedSegments({ [segmentIndex]: true });
    setTimeout(() => {
      setSelectedSegments({});
    }, 300);


    setUserSelections(prev => {
      const newSelections = {...prev};
      if (newSelections[segmentIndex]) {
        delete newSelections[segmentIndex]; // Toggle off if already selected
      } else {
        newSelections[segmentIndex] = true; // Toggle on
      }
      return newSelections;
    });
    // No scoring or toasts here; that happens on submit.
  };

  const handleSubmitResponse = () => {
    if (!currentStory) return;
    setStorySubmitted(true); // Mark story as submitted to change UI state

    // Placeholder for actual grading logic (will be detailed in next plan step)
    // For now, let's just show a toast. The real grading will update revealedErrors and score.

    let storyScoreChange = 0;
    const newRevealedErrors = {}; // Stores error.id for correctly identified errors in this submission
    const newFeedbackMessages = [];

    // 1. Check all actual errors defined in the story
    currentStory.errors.forEach(error => {
      const errorSegmentIndex = currentStory.content.findIndex(s => s.errorId === error.id);

      if (errorSegmentIndex !== -1) {
        const errorSegmentOriginalText = currentStory.content[errorSegmentIndex].text;
        if (userSelections[errorSegmentIndex]) { // User correctly identified this error
          storyScoreChange += 10;
          newRevealedErrors[error.id] = true;
          newFeedbackMessages.push({
            type: 'correct',
            titleKey: 'grammarDetective.feedbackCorrectTitle',
            originalText: errorSegmentOriginalText,
            correctText: error.correctPhrase,
            explanation: error.explanation,
            id: `fb-correct-${error.id}`
          });
        } else { // User missed this actual error
          storyScoreChange -= 5;
          newFeedbackMessages.push({
            type: 'missed',
            titleKey: 'grammarDetective.feedbackMissedTitle',
            originalText: errorSegmentOriginalText,
            correctText: error.correctPhrase,
            explanation: error.explanation,
            id: `fb-missed-${error.id}`
          });
        }
      }
    });

    // 2. Check all user selections for false positives
    Object.keys(userSelections).forEach(selectedIndexStr => {
      const selectedIndex = parseInt(selectedIndexStr, 10);
      const segment = currentStory.content[selectedIndex];
      if (segment && !segment.isError) { // User selected a segment that is NOT an error
        storyScoreChange -= 3;
        newFeedbackMessages.push({
          type: 'incorrect_selection',
          titleKey: 'grammarDetective.feedbackIncorrectSelectionTitle',
          originalText: segment.text,
          explanation: t('grammarDetective.feedbackIncorrectSelectionExpl', currentLanguage, { fallback: "This was not an error."}),
          id: `fb-incorrect-${selectedIndex}`
        });
      }
    });

    setScore(prev => Math.max(0, prev + storyScoreChange));
    setRevealedErrors(newRevealedErrors);
    setFeedbackMessages(newFeedbackMessages);
    // storySubmitted is already true

    toast({
      title: t('grammarDetective.responseSubmittedTitle', currentLanguage, { fallback: "Results Evaluated" }),
      description: t('grammarDetective.responseSubmittedDesc', currentLanguage, { fallback: "Review the feedback below and click 'Next Story' to continue." }),
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
    // In the next step, this function will:
  };

  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prevIndex => prevIndex + 1); // This will trigger useEffect to load new story & call resetStoryState
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

  const allErrorsFound = React.useMemo(() => {
    // This hook's meaning changes. It's no longer about *live* finding.
    // It might be used *after* submission to check if all *actual* errors were part of user's correct selections.
    // Or, it might be removed if not directly used in UI logic post-submission for enabling next button.
    // For now, the "Next Story" button appears simply when storySubmitted is true.
    if (!currentStory || !currentStory.errors || !storySubmitted) return false;

    let allCorrectlyIdentified = true;
    if (currentStory.errors.length === 0 && Object.keys(userSelections).length > 0) {
        // Story has no errors, but user selected some.
        allCorrectlyIdentified = false;
    } else {
        for (const error of currentStory.errors) {
            const errorSegmentIndex = currentStory.content.findIndex(s => s.errorId === error.id);
            if (errorSegmentIndex === -1 || !userSelections[errorSegmentIndex]) {
                allCorrectlyIdentified = false; // Missed an error
                break;
            }
        }
        if (allCorrectlyIdentified) {
            for (const selectedIndex in userSelections) {
                if (!currentStory.content[parseInt(selectedIndex)].isError) {
                    allCorrectlyIdentified = false; // Selected a non-error
                    break;
                }
            }
        }
    }
    return allCorrectlyIdentified;
  }, [currentStory, userSelections, storySubmitted]);

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
                  bg={
                    storySubmitted ?
                      (revealedErrors[segment.errorId] ? 'green.100' : // POST-SUBMISSION: Correctly found error
                        (segment.isError ? 'orange.100' : // POST-SUBMISSION: Missed actual error
                          (userSelections[index] ? 'red.100' : 'transparent'))) : // POST-SUBMISSION: Incorrectly selected non-error vs correctly ignored
                    (userSelections[index] ? 'blue.100' : // PRE-SUBMISSION: User's current selection
                      (selectedSegments[index] ? 'yellow.100' : // PRE-SUBMISSION: Brief click highlight
                        'gray.100')) // PRE-SUBMISSION: Default clickable
                  }
                  color={
                    storySubmitted ?
                      (revealedErrors[segment.errorId] ? 'green.700' :
                        (segment.isError ? 'orange.700' :
                          (userSelections[index] ? 'red.700' : 'inherit'))) :
                    (userSelections[index] ? 'blue.700' : 'inherit') // PRE-SUBMISSION: Blue text for selected items
                  }
                  fontWeight={
                    // PRE-SUBMISSION: Bold if selected by user.
                    // POST-SUBMISSION: Bold if it was an actual error (missed or found) or if user incorrectly selected a non-error.
                    (userSelections[index] && !storySubmitted) ||
                    (storySubmitted && (segment.isError || userSelections[index])) || // If it's an error, or user selected it
                    revealedErrors[segment.errorId] // If it was a correctly revealed error
                    ? 'bold' : 'normal'
                  }
                  cursor={storySubmitted ? 'default' : 'pointer'}
                  onClick={() => handleSegmentClick(segment, index)}
                  _hover={storySubmitted ? {} : { bg: 'yellow.200', color: 'black' }} // Hover only if not submitted
                  p={1} // Padding for all segments to make them feel like distinct clickable entities
                  borderRadius="md"
                  mr="2px" // Minimal space between words
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

            {/* Submit Button */}
            {!storySubmitted && currentStory && (
              <Button
                colorScheme="green"
                onClick={handleSubmitResponse}
                mt={4}
                alignSelf="center"
              >
                {t('grammarDetective.submitResponse', currentLanguage, {fallback: "Submit Response"})}
              </Button>
            )}

            {/* Next Story/Finish Category Button - Condition Corrected */}
            {storySubmitted && !gameCompleted && currentStory && (
              <Button colorScheme="blue" onClick={nextStory} mt={3} alignSelf="center">
                {currentStoryIndex < stories.length - 1 ? t('quiz.nextQuestion', currentLanguage) : t('quiz.finishQuiz', currentLanguage, {fallback: "Finish Category"})}
              </Button>
            )}
          </VStack>
        ) : (
          !gameCompleted && <Text textAlign="center" p={5}>{currentCategoryId ? t('quiz.loading', currentLanguage) : t('grammarDetective.selectCategoryPrompt', currentLanguage, {fallback: "Please select a category to start."})}</Text>
        )}
         <Button onClick={tryAgainCategory} colorScheme="orange" mt={4} isLoading={!currentStory && !gameCompleted && stories.length > 0} variant="outline">
            {t('quiz.tryAgain', currentLanguage, {fallback: "Restart Category"})}
        </Button>
      </VStack>
    </Box>
  );
};

export default GrammarDetectiveGame;
