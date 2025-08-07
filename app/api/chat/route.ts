// app/api/chat/route.ts

import { groq } from "@ai-sdk/groq";
import { generateText, tool } from "ai";
import { z } from "zod";

export const maxDuration = 30;

// Enhanced system prompt for better formatting and professional presentation
const systemPrompt = `You are Alinnia AI, an advanced intelligent financial assistant powered by Llama 3.3 70B for the Alinnia analytics platform.

Your enhanced capabilities include:
- Analyzing financial data, business metrics, and analytics with advanced reasoning
- Providing clear, concise, and professional insights with detailed explanations
- Helping users understand complex dashboards, reports, and financial trends
- Offering strategic financial recommendations and forecasting insights
- Explaining complex financial concepts in accessible language

Your personality:
- Professional yet approachable
- Detail-oriented but concise
- Proactive in suggesting relevant follow-up questions
- Honest about limitations and uncertainties

FORMATTING GUIDELINES:
- Use markdown formatting for better readability
- Use **bold text** for key terms and important concepts
- Use headers (## or ###) to organize complex responses
- Use bullet points (-) for lists and key points
- Use numbered lists (1.) for step-by-step processes
- Use \`inline code\` for financial formulas or specific values
- Use professional emojis sparingly but effectively (📊 📈 💰 💡 ⚠️ ✅ 🎯)

RESPONSE STRUCTURE:
1. Start with a clear, direct answer
2. Use headers to organize detailed explanations
3. Include relevant context and reasoning with proper formatting
4. Use bullet points for key takeaways
5. End with actionable next steps when appropriate

PROFESSIONAL EMOJI USAGE:
- 📊 for data analysis topics
- 📈 for growth, trends, positive metrics
- 📉 for declining trends, risks
- 💰 for revenue, profit, financial gains
- 💡 for insights, recommendations, tips
- ⚠️ for warnings, risks, important notes
- ✅ for confirmed facts, completed items
- 🎯 for goals, targets, objectives
- 🔍 for analysis, investigation
- 📋 for reports, documentation

When responding:
1. Provide direct, actionable answers with proper formatting
2. Include relevant context and reasoning
3. Suggest next steps or related insights when appropriate
4. If you don't know something, clearly state your limitations
5. Never fabricate financial data or make unfounded claims

You are here to empower users with financial intelligence and strategic insights through clear, well-formatted communication.

When users ask about their specific data, organization, or business metrics, use the accessData tool to get their actual information.

WHEN TO USE THE accessData TOOL:
- User asks about "my organization", "my data", "my business"
- Questions about their dashboards, analytics setup
- Requests about their uploaded files or data sources
- Any question that requires their specific business information

AVAILABLE DATA TYPES:
- **financial_summary**: Organization details and data overview
- **dashboard_metrics**: Analytics dashboards and widgets
- **recent_transactions**: Recent data uploads and activity
- **cash_flow**: Team and business intelligence setup

For general financial advice or concepts, respond directly without using tools.`;

// Define data access tools for the AI
const dataAccessTool = tool({
  description: "Access user's business data and provide insights about their organization, dashboards, and data files",
  parameters: z.object({
    dataType: z.enum(['financial_summary', 'recent_transactions', 'dashboard_metrics', 'cash_flow']).describe("Type of data to retrieve"),
    query: z.string().describe("The user's specific question"),
  }),
  execute: async ({ dataType, query }) => {
    console.log("[TOOL] Executing data access:", { dataType, query });

    try {
      // Simple mock data for now to test tool execution
      const mockData = {
        financial_summary: {
          organization: { name: "Alinnia Business Intelligence", industry: "Technology" },
          totalDatasources: 2,
          summary: "Organization Overview: Alinnia Business Intelligence in the Technology industry with 2 active data sources."
        },
        dashboard_metrics: {
          totalDashboards: 1,
          totalWidgets: 3,
          summary: "Analytics Infrastructure: 1 active dashboard with 3 visualization widgets configured."
        },
        recent_transactions: {
          count: 2,
          summary: "Data Activity: 2 files uploaded including sales data and payment records."
        },
        cash_flow: {
          teamSize: 1,
          summary: "Business Intelligence: 1 team member managing data analytics capabilities."
        }
      };

      const result = mockData[dataType] || { summary: "Data not available for this request." };
      console.log("[TOOL] Returning result:", result);
      return result;

    } catch (error) {
      console.error("[TOOL] Error:", error);
      return { error: "Unable to access data", summary: "Data access is temporarily unavailable." };
    }
  },
});

export async function POST(req: Request) {
  try {
    console.log("[CHAT_API] Received request");

    const { messages } = await req.json();
    console.log("[CHAT_API] Messages received:", messages?.length || 0);

    // Check for the API key. It's good practice to keep this check.
    if (!process.env.GROQ_API_KEY) {
      console.error("[CHAT_API] GROQ_API_KEY is not configured");
      throw new Error("GROQ_API_KEY is not configured in environment variables.");
    }

    console.log("[CHAT_API] Using non-streaming approach with Llama 4 Scout");

    const result = await generateText({
      // Using Llama 3.3 70B - Stable production model
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages,
      tools: {
        accessData: dataAccessTool,
      },
      // Add some additional options for better error handling
      maxTokens: 1000,
      temperature: 0.7,
    });

    console.log("[CHAT_API] Generation completed");
    console.log("[CHAT_API] Text length:", result.text?.length || 0);
    console.log("[CHAT_API] Tool calls:", result.toolCalls?.length || 0);

    // Handle tool calls if present
    let finalText = result.text;
    if (result.toolCalls && result.toolCalls.length > 0) {
      console.log("[CHAT_API] Processing tool calls...");
      // The AI SDK should have already executed the tools and included results
      // If we have tool calls but no text, provide a fallback
      if (!finalText || finalText.trim() === '') {
        finalText = "I'm analyzing your data to provide insights. Let me gather the information...";
      }
    }

    // Return as a simple JSON response
    return new Response(
      JSON.stringify({
        id: Date.now().toString(),
        role: "assistant",
        content: finalText || "I received your message but couldn't generate a response.",
        timestamp: new Date().toISOString(),
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error: any) {
    // Enhanced error handling to provide clearer feedback
    console.error("[CHAT_API_ERROR] Full error:", error);
    console.error("[CHAT_API_ERROR] Error message:", error?.message);
    console.error("[CHAT_API_ERROR] Error stack:", error?.stack);

    // Check for a specific authentication error from the AI SDK
    if (error?.message?.includes("401") || error?.status === 401) {
         console.error("[CHAT_API_ERROR] Authentication error detected");
         return new Response(
            JSON.stringify({ error: "Authentication error. Please check your GROQ_API_KEY." }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    // Check for rate limiting
    if (error?.message?.includes("429") || error?.status === 429) {
         console.error("[CHAT_API_ERROR] Rate limit error detected");
         return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
            { status: 429, headers: { "Content-Type": "application/json" } }
        );
    }

    // Check if it's a tool-related error
    if (error.message?.includes('tool') || error.message?.includes('function') || error.message?.includes('accessData')) {
      console.error("[CHAT_API_ERROR] Tool execution error detected");
      return new Response(
        JSON.stringify({
          id: Date.now().toString(),
          role: "assistant",
          content: "I'm having trouble accessing your data right now. Let me help you with general financial guidance instead. What specific area would you like to discuss?",
          timestamp: new Date().toISOString(),
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
        JSON.stringify({
          error: "An unexpected error occurred. Please try again.",
          details: error?.message || "Unknown error"
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}