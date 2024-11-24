"use client";

import StartQuizLoader from "@/components/start-quiz-loader";
import { useQuizContext } from "@/Context/Store";
import { fetchNextQuestion } from "@/lib/fetchNextQues";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";

export default function QuizStart({ params }: { params: { quizId: String } }) {
  const router = useRouter();
  const isLoading = useRef(false);
  const { quizData, setQuestionData } = useQuizContext();
  console.log("dw", quizData);
  async function handleStartQuiz() {
    isLoading.current = true;
    await fetchNextQuestion(quizData.questionIds[0], setQuestionData);
    isLoading.current = false;
    router.push(`/quiz/${params.quizId}/${quizData.questionIds[0]}`);
  }
  if (isLoading.current) return <StartQuizLoader />;
  return (
    <div className="flex flex-col bg-organe-100 items-center gap-2">
      <h1 className="font-bold text-2xl min-[375px]:text-3xl sm:text-4xl md:text-3xl uppercase">
        {quizData.topic}
      </h1>
      <h2 className="text-xl font-semibold">
        {quizData.questionIds.length} Questions
      </h2>
      <div className="flex items-center gap-4">
        <Link
          href="/quiz"
          className="px-4 py-2 transition-colors duration-200 rounded-full border-[3px] border-sky-500 text-sky-500 font-bold hover:bg-sky-600 hover:text-white"
        >
          Back to Quizzes
        </Link>
        <button
          onClick={handleStartQuiz}
          className="px-4 py-2 transition-colors duration-200 rounded-full border-[3px] border-emerald-500 text-emerald-500 font-bold hover:bg-emerald-600 hover:text-white"
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
}
