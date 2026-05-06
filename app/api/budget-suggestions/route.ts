import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"
import { createSupabaseServerClient } from "@/lib/supabase-server"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })

    const { categoryName, variants, selectedVariant, projectContext } = await req.json()

    const { constructionPath, city, currency, budget, homeType, homeEra } = projectContext ?? {}

    const userMessage = [
      `Project: ${constructionPath ?? "home renovation"}${city ? `, ${city}` : ""}`,
      budget ? `Budget: ${currency === "GBP" ? "£" : "$"}${Number(budget).toLocaleString()}` : null,
      homeType || homeEra ? `Home: ${[homeType, homeEra].filter(Boolean).join(", ")}` : null,
      `Category: ${categoryName}`,
      `Options: ${(variants as string[]).join(", ")}`,
      `Currently selected: ${selectedVariant}`,
      "Advise on the best choice for this project.",
    ].filter(Boolean).join("\n")

    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      system: `You are a construction material advisor for Alinnia, a project management app. Given a project's context and a work category, write exactly 2-3 sentences recommending which material variant to choose and why, covering durability, budget fit, maintenance, and resale value where relevant. Name the recommended variant explicitly. No markdown, no headers, no bullet points — plain prose only.`,
      messages: [{ role: "user", content: userMessage }],
      maxTokens: 200,
    })

    return new Response(JSON.stringify({ suggestion: result.text }))
  } catch (error: any) {
    console.error("Budget suggestions error:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
}
