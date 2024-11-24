"use client";

import { createContext, useContext, useState } from "react";

// Define types for queston data
interface QuestionData {
  questionId: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: string;
}

// Define types for quiz data
interface QuizData {
  topic: string;
  questionIds: string[];
  score: number;
  attempts: number;
  quizId: string;
  questionsAttempted: number;
}

// Define context structure
interface QuizContextType {
  quizData: QuizData;
  questionData: QuestionData;
  updateScore: (newScore: number) => void;
  incrementAttempts: () => void;
  setQuizData: (data: QuizData) => void;
  setQuestionData: (data: QuestionData) => void;
  resetAllData: () => void;
}

// Create the context
const QuizContext = createContext<QuizContextType | undefined>(undefined);

// Quiz Provider component
export const QuizProvider = ({ children }: { children: React.ReactNode }) => {
  const [quizData, setQuizData] = useState<QuizData>({
    topic: "",
    questionIds: [],
    score: 0,
    attempts: 0,
    quizId: "",
    questionsAttempted: 0,
  });
  const [questionData, setQuestionData] = useState<QuestionData>({
    questionId: "",
    question: "",
    options: {
      A: "",
      B: "",
      C: "",
      D: "",
    },
    correct_answer: "",
  });

  // Update score
  const updateScore = (newScore: number) => {
    setQuizData((prev) => ({
      ...prev,
      score: newScore,
      questionsAttempted: prev.questionsAttempted + 1,
    }));
  };

  // Increment attempts
  const incrementAttempts = () => {
    setQuizData((prev) => ({ ...prev, attempts: prev.attempts + 1 }));
  };

  // Set initial quiz data
  const setQuizDataHandler = (data: QuizData) => {
    setQuizData(data);
  };

  // Set current question
  const setQuestionHandler = (data: QuestionData) => {
    setQuestionData(data);
  };

  // Reset All Data
  const resetAllData = () => {
    setQuizData({
      topic: "",
      questionIds: [],
      score: 0,
      attempts: 0,
      quizId: "",
      questionsAttempted: 0,
    });
    setQuestionData({
      questionId: "",
      question: "",
      options: {
        A: "",
        B: "",
        C: "",
        D: "",
      },
      correct_answer: "",
    });
  };

  return (
    <QuizContext.Provider
      value={{
        quizData,
        questionData,
        updateScore,
        incrementAttempts,
        setQuizData: setQuizDataHandler,
        setQuestionData: setQuestionHandler,
        resetAllData,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

// Custom hook to use the QuizContext
export const useQuizContext = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuizContext must be used within a QuizProvider");
  }
  return context;
};
