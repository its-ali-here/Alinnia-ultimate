// app/api/chat/route.ts
import { groq } from "@ai-sdk/groq";
import { generateText, tool } from "ai";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase-server";

export const maxDuration = 60; // Increased for complex reasoning

export async function POST(req: Request) {
  try {
    const { messages, organizationId } = await req.json();

    // 1. FETCH CONTEXT: Give the AI "Eyes" on your actual files
    // We fetch the list of files and their columns so the AI knows what to visualize.
    const supabase = createSupabaseAdminClient();
    
    // Fallback for demo purposes if no org ID provided
    let targetOrgId = organizationId;
    if (!targetOrgId) {
       const { data: orgs } = await supabase.from('organizations').select('id').limit(1);
       targetOrgId = orgs?.[0]?.id;
    }

    const { data: datasources } = await supabase
      .from('datasources')
      .select('id, file_name, column_definitions')
      .eq('organization_id', targetOrgId)
      .eq('status', 'ready')
      .limit(10);

    // Create a "Context String" to inject into the AI
    const dataContext = datasources?.map(ds => 
      `File: "${ds.file_name}" (ID: ${ds.id})\nColumns: ${JSON.stringify(ds.column_definitions)}`
    ).join('\n\n') || "No data files available.";

    // 2. DEFINE THE TOOL
    // This tool lets the AI say: "I want to build a bar chart using File X"
    const visualizationTool = tool({
        description: "Generate a dashboard widget (Chart, Map, or Metric) to visualize data.",
        parameters: z.object({
            title: z.string().describe("A short, descriptive title for the chart"),
            datasourceId: z.string().describe("The exact ID of the file to use (from context)"),
            chartType: z.enum(['bar', 'line', 'pie', 'area', 'scatter', 'summary-card']).describe("The best visualization type"),
            query: z.object({
                // We make these optional because different charts need different keys
                categoryKey: z.string().optional().describe("Column for X-Axis (Categories)"),
                valueKey: z.string().optional().describe("Column for Y-Axis (Values)"),
                xAxisKey: z.string().optional().describe("For Scatter plots only"),
                yAxisKey: z.string().optional().describe("For Scatter plots only"),
                columnName: z.string().optional().describe("For Summary Cards only"),
                aggregationType: z.enum(['sum', 'average', 'count', 'min', 'max']).optional(),
            }).describe("The configuration for the data query")
        }),
        execute: async (config) => {
            // We just return the config. The frontend will do the heavy lifting (rendering).
            return {
                isWidget: true,
                config: config
            };
        },
    });

    // 3. SYSTEM PROMPT
    const systemPrompt = `You are Alinnia AI, a Data Analyst.
    
    YOUR GOAL: Help the user visualize their data.
    
    AVAILABLE DATA FILES:
    ${dataContext}
    
    RULES:
    1. If the user asks for a chart, trends, or summary, USE the 'generate_visualization' tool.
    2. Look at the "AVAILABLE DATA FILES" to find the correct 'datasourceId' and column names.
    3. Do NOT make up column names. Use exactly what is listed above.
    4. For "Trends" or "Over time", use a LINE chart.
    5. For "Comparison", use a BAR chart.
    6. For "Composition" or "Share", use a PIE chart.
    7. For "KPIs" or single numbers, use 'summary-card'.
    
    If the user asks a general question, just answer text.
    `;

    // 4. RUN AI
    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages,
      tools: {
        generate_visualization: visualizationTool,
      },
      maxTokens: 1000,
    });

    // 5. HANDLE RESPONSE
    // We need to see if the tool was called and send that payload to the frontend
    let finalContent = result.text;
    let widgetPayload = null;

    if (result.toolResults && result.toolResults.length > 0) {
        const toolOutput = result.toolResults[0].result as any;
        if (toolOutput.isWidget) {
            widgetPayload = toolOutput.config;
            finalContent = `Here is the visualization for **${toolOutput.config.title}**.`;
        }
    }

    return new Response(JSON.stringify({
        role: "assistant",
        content: finalContent,
        widgetConfig: widgetPayload // <--- This is the magic payload
    }));

  } catch (error: any) {
    console.error("AI Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}