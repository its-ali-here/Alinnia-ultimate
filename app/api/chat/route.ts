import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const systemPrompt = `You are Alinnia Assistant, a helpful project management advisor for homeowners and contractors managing construction and renovation projects.

You help users with questions about:
- Budget tracking and cost management (are they on budget, where is money going)
- Material planning, stock levels, and ordering
- Project phases, timelines, and scheduling
- Punch list tasks and work completion
- Contractor and supplier coordination
- Common renovation/construction advice

Be concise, practical, and specific. When you don't have access to the user's actual project data, give general best-practice advice relevant to construction and renovation projects.`;

    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages,
      maxTokens: 800,
    });

    return new Response(JSON.stringify({
      role: "assistant",
      content: result.text,
    }));

  } catch (error: any) {
    console.error("AI Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
