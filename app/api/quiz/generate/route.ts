import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { parseQuestions } from "@/lib/question-parser";
import prismadb from "@/lib/prismadb";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const instructionMessage: ChatCompletionMessageParam = {
  role: "system",
  content: `Your sole purpose is to function as a quiz generator. You will only respond to requests to generate, present, and evaluate quizzes. You will not engage in conversations outside this scope. If the user tries to engage in conversations, just give the user the instruction message "Not meant for conversations" without the "" symbols.
    This topic will guide the generation of quiz questions. For each question, generate a given number of multiple-choice questions (MCQs) relevant to the user's specified topic. Provide four options for each question, out of which only one is correct. Ensure that options are well-formatted and listed clearly using bullet points or numbering (e.g., A, B, C, D). All questions and options must be presented in a well-formatted markdown format to ensure clarity and proper structure. The format for the questions, options and correct answer should be:
    Question:
        A:
        B:
        C:
        D:
    Correct Option: (this should be A, B, C, or D)
    This should be done for each question. No question number required. 2 new lines should be there at the end of each question. No entry-level statements should be there. The options and the question should be separated by a new line.
    Do not respond to or entertain questions or conversations that fall outside of generating, presenting, or evaluating quiz questions. Simply give the message "Not meant for conversations" without the "" symbols.`,
};

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { message } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return new NextResponse("OpenAI API Key not configured", { status: 500 });
    }

    if (!message) {
      return new NextResponse("Message is required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();

    if (!freeTrial) {
      return new NextResponse("Free tial has expired.", { status: 403 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [instructionMessage, message],
    });

    await increaseApiLimit();

    if (
      response.choices[0].message?.content === "Not meant for conversations"
    ) {
      return new NextResponse("Not meant for conversations", { status: 500 });
    }

    const questionsList = parseQuestions(response.choices[0].message?.content);

    console.log(questionsList);

    if (!questionsList) {
      return new NextResponse("Internal error", { status: 500 });
    }

    const quiz = await prismadb.quiz.create({
      data: {
        userId,
        topic: message?.content.split("*****")[0].trim(),
      },
    });

    let questions: any = questionsList.map(async (question) => {
      return await prismadb.question.create({
        data: {
          quizId: quiz.id,
          question: question.question,
          options: JSON.stringify(question.options),
          answer: question.correct_answer,
          userId,
        },
      });
    });

    questions = await Promise.all(questions);

    await prismadb.quiz.update({
      where: {
        id: quiz.id,
      },
      data: {
        questions: questions.map((question: any) => question.id),
      },
    });

    return NextResponse.json({
      topic: quiz.topic,
      questions: questions.map((question: any) => ({
        id: question.id,
        question: question.question,
        options: JSON.parse(question.options),
        answer: question.answer,
      })),
      score: quiz.score,
      attempts: quiz.attempts,
      quizId: quiz.id,
    });
  } catch (error) {
    console.log("[QUIZ_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
