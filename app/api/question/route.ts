import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get("questionId");

    if (!questionId) {
      return new NextResponse("Question ID not provided", { status: 400 });
    }

    const question = await prismadb.question.findUnique({
      where: {
        id: questionId,
      },
    });

    return NextResponse.json({
      questionId: question?.id,
      question: question?.question,
      options: question ? JSON.parse(question.options) : {},
      answer: question?.answer,
    });
  } catch (error) {
    console.log("[QUESTION_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
