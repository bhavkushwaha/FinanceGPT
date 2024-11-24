"use client";

import { useQuizContext } from "@/Context/Store";
import { cn } from "@/lib/utils";
import { CircleArrowRight, RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface QuizCardProps {
  topic: string;
  questionId: [string];
  score: number;
  attempts: number;
  quizId: string;
}

const QuizCard = ({
  topic,
  questionId,
  score,
  attempts,
  quizId,
}: QuizCardProps) => {
  const router = useRouter();
  const { setQuizData } = useQuizContext();
  function handleEnterQuiz() {
    setQuizData({
      topic,
      questionIds: questionId,
      score: 0,
      attempts,
      quizId,
      questionsAttempted: 0,
    });
    router.push(`/quiz/${quizId}`);
  }
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-full flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">{topic}</h2>
        <p className="text-sm text-gray-700 mb-2">
          Score: <span className="font-medium">{score}%</span>
        </p>
        <p className="text-sm text-gray-700 mb-2">
          Attempts:{" "}
          <span className="font-medium">{attempts ? attempts : 0}</span>
        </p>
        <p className="text-sm text-gray-700">
          Number of Questions:{" "}
          <span className="font-medium">{questionId.length}</span>
        </p>
      </div>
      <div className="flex flex-col items-center justify-center cursor-pointer">
        <button onClick={handleEnterQuiz}>
          {!attempts ? (
            <CircleArrowRight className="w-10 h-10 text-violet-800" />
          ) : (
            <RotateCw className="w-10 h-10 text-yellow-600" />
          )}
        </button>
        <p
          className={cn(
            "text-md font-medium",
            !attempts ? "text-violet-800" : "text-yellow-600"
          )}
        >
          {!attempts ? (
            <>&nbsp;&nbsp;&nbsp;Attempt&nbsp;&nbsp;&nbsp;</>
          ) : (
            "Re-attempt"
          )}
        </p>
      </div>
    </div>
  );
};

export default QuizCard;
