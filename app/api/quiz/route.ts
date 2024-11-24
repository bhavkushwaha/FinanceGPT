import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const quizzes = await prismadb.quiz.findMany({
      where: {
        userId,
      },
    });

    return NextResponse.json(
      quizzes.map((quiz) => ({
        topic: quiz.topic,
        questionId: quiz.questions,
        score: quiz.score,
        attempts: quiz.attempts,
        quizId: quiz.id,
      }))
    );
  } catch (error) {
    console.log("[QUIZ_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { score, attempts, id } = body;

    const quiz = await prismadb.quiz.update({
      where: {
        id,
      },
      data: {
        score,
        attempts,
      },
    });

    return NextResponse.json({
      topic: quiz.topic,
      questionId: quiz.questions,
      score: quiz.score,
      attempts: quiz.attempts,
      quizId: quiz.id,
    });
  } catch (error) {
    console.log("[QUIZ_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
