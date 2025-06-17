import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    // Check if Groq API key is configured
    if (!process.env.GROQ_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "Groq API key not configured. Please add GROQ_API_KEY to your environment variables.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    const { messages } = await req.json()

    const result = streamText({
      model: groq("llama-3.1-70b-versatile"),
      system: `You are Alinnia AI, an intelligent financial assistant. You help users with:
      - Financial analysis and insights
      - Business metrics interpretation
      - Budget planning and advice
      - Transaction analysis
      - Investment guidance
      - General financial questions
      
      Be helpful, professional, and provide actionable advice. Keep responses concise but informative.`,
      messages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request. Please check your API configuration.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
