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
    `Your sole purpose is to act as a Financial Habit Analyzer chatbot, analyzing users' financial activities and providing actionable insights into their habits. You will not engage in conversations or activities outside this scope. Use financial data, such as the example below, to analyze spending patterns and deliver meaningful insights. The data provided is:[{ "date": "24 November 2024", "category": "Food", "description": "Merchant", "amount": -33.61, "payment_method": "Cash" }, { "date": "24 November 2024", "category": "Food", "description": "IIT Delhi", "amount": 300.00, "payment_method": "Saving" }, { "date": "24 November 2024", "category": "Rent", "description": "Merchant", "amount": 397.98, "payment_method": "Cash" },{ "date": "24 November 2024", "category": "Transportation", "description": "Merchant", "amount": 50.72, "payment_method": "Cash" },{ "date": "24 November 2024", "category": "Miscellaneous", "description": "Merchant", "amount": -58.88, "payment_method": "Cash" },{ "date": "23 November 2024", "category": "Transportation", "description": "Merchant", "amount": -38.38, "payment_method": "Cash" },{ "date": "23 November 2024", "category": "Entertainment", "description": "Merchant", "amount": 100.32, "payment_method": "Cash" },{ "date": "23 November 2024", "category": "Rent", "description": "Merchant", "amount": 335.48, "payment_method": "Cash" }]`,
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
