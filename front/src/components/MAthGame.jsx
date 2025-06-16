import { Box, Button, Flex, Heading } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";

function generateQuestions(count = 100) {
  const operators = ["+", "-", "×", "÷"];
  const questions = [];

  while (questions.length < count) {
    const a = Math.floor(Math.random() * 20) + 1;
    const b = Math.floor(Math.random() * 20) + 1;
    const op = operators[Math.floor(Math.random() * operators.length)];

    let expression = `${a} ${op} ${b}`;
    let correct;

    switch (op) {
      case "+":
        correct = a + b;
        break;
      case "-":
        correct = a - b;
        break;
      case "×":
        correct = a * b;
        break;
      case "÷":
        if (a % b !== 0) continue; // Skip non-integer division
        correct = a / b;
        break;
    }

    // Avoid negative or infinite results
    if (correct < 0 || !isFinite(correct)) continue;

    // Generate choices including the correct answer
    const choices = new Set([correct]);
    while (choices.size < 4) {
      const delta = Math.floor(Math.random() * 10) - 5;
      const option = correct + delta;
      if (option >= 0) choices.add(option);
    }

    questions.push({
      expression,
      choices: Array.from(choices).sort(() => Math.random() - 0.5), // Shuffle
      correct,
    });
  }

  return questions;
}
const questions = generateQuestions(10);
const MAthGame = () => {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("");
  const [timer, setTimer] = useState(10);
  const [showSummary, setShowSummary] = useState(false);
  const [wrongStreak, setWrongStreak] = useState(0);
  const [started, setStarted] = useState(false); // <-- New state

  const current = questions[index];

  useEffect(() => {
    if (!started || showSummary) return;

    if (timer === 0) {
      setStatus("Time's up!");
      setWrongStreak((w) => {
        const newStreak = w + 1;
        if (newStreak >= 3) setShowSummary(true);
        return newStreak;
      });
      setTimeout(nextQuestion, 1000);
      return;
    }

    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, started, showSummary]);

  const handleChoice = (choice) => {
    if (choice === current.correct) {
      setScore((s) => s + 1);
      setStatus("Correct ✅");
      setWrongStreak(0);
    } else {
      setStatus("Wrong ❌");
      setWrongStreak((w) => {
        const newStreak = w + 1;
        if (newStreak >= 3) setShowSummary(true);
        return newStreak;
      });
    }

    setTimeout(() => {
      if (!showSummary) nextQuestion();
    }, 1000);
  };

  const nextQuestion = () => {
    setStatus("");
    setTimer(10);
    if (index + 1 < questions.length) {
      setIndex((i) => i + 1);
    } else {
      setShowSummary(true);
    }
  };

  const restartQuiz = () => {
    setIndex(0);
    setScore(0);
    setStatus("");
    setTimer(10);
    setWrongStreak(0);
    setShowSummary(false);
    setStarted(false); // Reset to start screen
  };

  return (
    <div className="h-fit flex flex-col items-center justify-start bg-gray-100 text-center p-6 w-full text-gray-800">
      {!started ? (
        <Flex
          direction="column"
          gap={5}
          justify="center"
          align={"center"}
          w="full"
          borderRadius={"full"}
          bg="primary"
          py={4}
        >
          <Heading color="white">🧠 Welcome to the Math Quiz</Heading>

          <div className="button" onClick={() => setStarted(true)}>
            <button name="checkbox" type="button"></button>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </Flex>
      ) : !showSummary ? (
        <>
          <header className="w-full bg-teal-500 p-4 mb-6">
            <h1 className="text-3xl font-bold text-white">🧠 Math Quiz</h1>
          </header>

          <div className="bg-white h-[300px] shadow-md rounded flex flex-col gap-5 px-8 pt-6 pb-8 mb-4 w-full ">
            <div className="mb-4">
              <div className="bg-teal-500 text-xl font-semibold text-blue-600">
                🏆 Score: {score}
              </div>
              <div className="bg-teal-500 text-lg font-bold  px-4 py-2 shadow mt-2">
                ⏱ Time: {timer}s
              </div>
            </div>

            <div className="text-3xl font-bold bg-yellow-100 px-6 py-4 rounded mb-4">
              {current.expression}
            </div>

            <div className="grid grid-cols-2 gap-6 m-6">
              {current.choices.map((choice, i) => (
                <Button
                  key={i}
                  onClick={() => handleChoice(choice)}
                  colorScheme="blue"
                >
                  {choice}
                </Button>
              ))}
            </div>

            <div className="text-md text-gray-700 h-6">{status}</div>
          </div>
        </>
      ) : (
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
          <p className="text-xl mb-4">Your final score is: {score}</p>
          <button
            onClick={restartQuiz}
            className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded"
          >
            Restart Quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default MAthGame;
