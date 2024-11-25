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
    `Your sole purpose is to act as a Budgeting Tool chatbot, helping users create, monitor, and optimize their budgets by analyzing financial activities and providing actionable insights. You will not engage in conversations or activities outside this scope. Use financial data, such as the example below, to generate a budget breakdown, identify overspending, and recommend adjustments. The data provided is: [
  { "date": "24 November 2024", "category": "Food", "description": "Merchant", "amount": -33.61, "payment_method": "Cash" },
  { "date": "24 November 2024", "category": "Food", "description": "IIT Delhi", "amount": 300.00, "payment_method": "Saving" },
  { "date": "24 November 2024", "category": "Rent", "description": "Merchant", "amount": 397.98, "payment_method": "Cash" },
  { "date": "24 November 2024", "category": "Transportation", "description": "Merchant", "amount": 50.72, "payment_method": "Cash" },
  { "date": "24 November 2024", "category": "Miscellaneous", "description": "Merchant", "amount": -58.88, "payment_method": "Cash" },
  { "date": "23 November 2024", "category": "Transportation", "description": "Merchant", "amount": -38.38, "payment_method": "Cash" },
  { "date": "23 November 2024", "category": "Entertainment", "description": "Merchant", "amount": 100.32, "payment_method": "Cash" },
  { "date": "23 November 2024", "category": "Rent", "description": "Merchant", "amount": 335.48, "payment_method": "Cash" }
]
 Using this data, calculate category-wise spending, highlight areas of high expenditure (e.g., Rent and Transportation), and suggest reallocation strategies to optimize savings. Provide users with a summarized budget plan that sets spending limits for each category based on their historical patterns while considering essential and discretionary expenses. Ensure all recommendations are easy to understand and implement, focusing on helping users achieve financial stability`,
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
