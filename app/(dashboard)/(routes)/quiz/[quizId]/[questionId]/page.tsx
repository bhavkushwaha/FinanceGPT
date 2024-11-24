"use client";
import QuizProgress from "@/components/quiz-progress";
import { useQuizContext } from "@/Context/Store";
import { ChevronLeft, ChevronRight, ListCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import axios from "axios";
import { fetchNextQuestion } from "@/lib/fetchNextQues";

interface Options {
  A: string;
  B: string;
  C: string;
  D: string;
}

interface Content {
  options: Options;
  // Add other properties here if needed
}

async function updateQuizData(score: number, attempts: number, id: string) {
  try {
    const response = await axios.patch("/api/quiz", {
      score,
      attempts,
      id,
    });
    console.log("fqd", response.data);
  } catch (error: any) {
    console.log(error);
  }
}

export default function Quiz({ params }: { params: { questionId: string } }) {
  const router = useRouter();
  const { register, handleSubmit, watch } = useForm({
    defaultValues: { selectedOption: "" },
  });
  const [result, setResult] = useState<number>(0);
  const { questionData, quizData, updateScore, setQuestionData, resetAllData } =
    useQuizContext();
  const selection = watch("selectedOption");
  const questionOptions = Object.keys(questionData.options).map((key) => {
    const value = questionData.options[key as keyof Options]; // Type assertion
    return { option: key, value };
  });

  function handleCheck(data: { selectedOption: String }) {
    if (data.selectedOption === questionData.correct_answer) {
      setResult(1);
      updateScore(quizData.score + 1);
    } else {
      setResult(-1);
      updateScore(quizData.score);
    }
  }

  async function handleNextQues() {
    if (quizData.questionsAttempted === quizData.questionIds.length) {
      const finalScore = (quizData.score / quizData.questionIds.length) * 100;
      const totalAttempts = quizData.attempts + 1;
      resetAllData();
      await updateQuizData(finalScore, totalAttempts, quizData.quizId);
      router.push("/quiz");
    } else {
      await fetchNextQuestion(
        quizData.questionIds[quizData.questionsAttempted],
        setQuestionData
      );
      router.push(
        `/quiz/${quizData.quizId}/${
          quizData.questionIds[quizData.questionsAttempted]
        }`
      );
    }
  }
  return (
    <div className="flex flex-col h-screen gap-8">
      <div className="px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/quiz" className="text-3xl">
            <ChevronLeft size={34} />
          </Link>
          <h1 className="text-3xl min-[500px]:text-4xl font-semibold">
            {quizData.topic}
          </h1>
        </div>
        <QuizProgress
          totalQuestions={quizData.questionIds.length}
          attemptedQuestions={quizData.questionsAttempted}
        />
      </div>
      <div className="flex flex-col gap-5 px-8 lg:px-20 text-xl">
        <h1 className="font-semibold text-2xl">{questionData.question}</h1>
        <form
          className="flex flex-col gap-6 w-full"
          onSubmit={handleSubmit(handleCheck)}
        >
          {questionOptions.map((opt, ind) => (
            <label
              key={ind}
              className={`flex items-center gap-4 border-[1px] px-4 py-2 rounded-xl ${
                result !== 0 && opt.option === questionData.correct_answer
                  ? "bg-emerald-200 text-emerald-600"
                  : ""
              } ${
                result === -1 && opt.option === selection
                  ? "bg-red-200 text-red-600"
                  : ""
              }`}
            >
              <input
                type="radio"
                value={opt.option}
                {...register("selectedOption")}
                className="h-4 w-4"
              />
              {opt.value}
            </label>
          ))}
          {result === 0 ? (
            <button
              type="submit"
              className="disabled:cursor-not-allowed border-[3px] font-semibold text-emerald-600 text-2xl border-emerald-500 hover:text-white transition-colors duration-150 hover:bg-emerald-500 w-fit mx-auto px-3 py-2 rounded-xl"
              disabled={selection === ""}
            >
              Submit
            </button>
          ) : (
            <div className="flex flex-col min-[420px]:flex-row gap-4 items-center justify-between w-full">
              <div className="w-full min-[420px]:w-fit text-center">
                <h1
                  className={`font-semibold text-xl uppercase ${
                    result === 1 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {result === 1 ? "correct answer" : "wrong answer"}
                </h1>
                {result === -1 && (
                  <h1 className="uppercase text-red-600 text-xs">
                    correct answer : {questionData.correct_answer}
                  </h1>
                )}
              </div>
              <button
                type="button"
                onClick={handleNextQues}
                className="disabled:cursor-not-allowed flex justify-center border-[3px] font-semibold text-emerald-600 text-lg border-emerald-500 hover:text-white transition-colors duration-150 hover:bg-emerald-500 w-full min-[420px]:w-fit px-3 py-2 rounded-xl"
              >
                {quizData.questionsAttempted !== quizData.questionIds.length ? (
                  <div className="flex items-center gap-2">
                    Next Question <ChevronRight size={32} />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ListCheck size={32} /> Finish Test
                  </div>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
