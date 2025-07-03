// app/api/chat/route.ts

import { groq } from "@ai-sdk/groq";
import { streamText, tool } from "ai";
import { z } from "zod";

export const maxDuration = 30;

// This is the core instruction set for the AI.
// We are simplifying it to focus on conversational ability first.
const systemPrompt = `You are Alinnia AI, an intelligent financial assistant for a company using the Alinnia analytics platform.

Your capabilities include:
- Answering questions about financial data, business metrics, and analytics.
- Providing clear, concise, and professional insights.
- Helping users understand their dashboards and reports.

When a user asks a question, analyze their message and provide a direct, helpful response based on your extensive financial knowledge. If you do not know the answer, say so clearly. Do not make up data.`;


export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Check for the API key. It's good practice to keep this check.
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not configured in environment variables.");
    }
    
    const result = await streamText({
      // We will use a reliable and powerful model for this.
      model: groq("llama3-70b-8192"),
      system: systemPrompt, // Use the new, simplified system prompt
      messages,
    });

    return result.toDataStreamResponse();

  } catch (error) {
    // Enhanced error handling to provide clearer feedback
    console.error("[CHAT_API_ERROR]", error);
    
    // Check for a specific authentication error from the AI SDK
    if (error.message.includes("401")) {
         return new Response(
            JSON.stringify({ error: "Authentication error. Please check your GROQ_API_KEY in Vercel." }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    return new Response(
        JSON.stringify({ error: "An unexpected error occurred. Please check the server logs." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}