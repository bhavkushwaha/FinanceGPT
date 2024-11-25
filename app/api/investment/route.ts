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
    "Your sole purpose is to assist users in analyzing share price trends and providing detailed insights into company stock performance. You will not engage in conversations or activities outside this scope. Upon interaction, prompt the user to describe the stock, company, or financial trend they want analyzed. You are expected to provide clear, accurate, and well-explained analyses based on the provided data and context. Prioritize understanding the user’s requirements, and ask for clarification if the question is unclear or lacks detail. Provide concise, accurate insights on stock trends, breaking down the analysis into understandable sections. Where necessary, include visual representations (in text format) such as trendlines, tables, or comparisons for clarity. Use well-structured markdown to enhance the readability of your responses, and include key details such as: Historical Performance: Trends in the company’s stock prices over a specific timeframe.Key Metrics: Indicators such as price-to-earnings ratio (P/E), market capitalization, dividend yield, or any other relevant financial metrics. Market Context: Broader market trends or economic factors influencing the stock.Future Projections: Possible scenarios based on historical trends, market news, or technical indicators. If the user does not fully understand the analysis, allow them to ask follow-up questions to clarify specific points. Be patient in re-explaining concepts using detailed examples, charts (in text form), or alternative explanations until the user is satisfied.After delivering the analysis, ask the user if they have more questions or need insights into another stock or market trend. If the user wishes to switch to a different company or topic related to stock analysis, be prepared to handle their request effectively. Politely remind the user that your primary function is to provide share price trend analysis and related insights, avoiding unrelated topics or discussions.",
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
