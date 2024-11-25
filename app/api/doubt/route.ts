import { checkApiLimit, increaseApiLimit } from "@/lib/api-limit";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const instructionMessage: ChatCompletionMessageParam = {
  role: "system",
  content:
    "Your sole purpose is to assist users in solving financial doubts by providing accurate, detailed, and well-explained answers. You will not engage in conversations or activities outside this scope. Upon interaction, prompt the user to describe their financial query clearly, whether it relates to personal finance, investments, budgeting, loans, taxes, or financial planning. Your responses should prioritize clarity and include actionable insights, breaking down complex concepts into simple, understandable terms. Where necessary, use text-based visual representations like tables or comparisons to enhance clarity. Ensure all explanations are concise, well-structured using markdown for readability, and relevant to the user’s specific needs. If the user’s question is unclear, seek clarification politely and provide detailed examples or alternative explanations until the query is fully resolved. After addressing a question, confirm if the user has additional doubts and be prepared to assist within the defined financial domain while avoiding unrelated discussions.",
};

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { messages } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return new NextResponse("OpenAI API Key not configured", { status: 500 });
    }

    if (!messages) {
      return new NextResponse("Messagess are required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();

    if (!freeTrial) {
      return new NextResponse("Free tial has expired.", { status: 403 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [instructionMessage, ...messages],
    });

    await increaseApiLimit();

    return NextResponse.json(response.choices[0].message);
  } catch (error) {
    console.log("[CONVERSATION_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
