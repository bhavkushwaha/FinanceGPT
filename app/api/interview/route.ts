import { checkApiLimit, increaseApiLimit } from '@/lib/api-limit';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const instructionMessage: ChatCompletionMessageParam = {
  role: "system",
  content: `
    Your purpose is to generate interview questions for the user based on the job title, job description, and their resume. The questions should cover different aspects relevant to the job, including technical skills, behavioral questions, and situational problems. Always aim to provide a variety of question types (open-ended, technical, etc.), and ensure that they align with the job description. The questions and answers should be provided in a well-formatted markdown format. Provide 2-3 questions with answers. Questions should be descriptive. Do not converse with the user that means no introductory line or paragraph.`
};

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return new NextResponse("OpenAI API Key not configured", { status: 500 });
    }

    const { messages } = await req.json();

    if (!messages) {
      return new NextResponse("Job Title and Job Description are required", { status: 400 });
    }

    const freeTrial = await checkApiLimit();
    if (!freeTrial) {
      return new NextResponse("Free trial has expired.", { status: 403 });
    }

    // Prepare user message for OpenAI API
    const userMessage = {
      role: "user",
      content: `${messages[messages.length - 1]}. Generate interview questions accordingly.`,
    };

    // OpenAI API call
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [instructionMessage, userMessage, ...messages],
    });

    // Increase API limit after a successful call
    await increaseApiLimit();

    // Return the generated message from the AI
    return NextResponse.json(response.choices[0].message);

  } catch (error) {
    console.log("[INTERVIEW_PREP_ERROR]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
