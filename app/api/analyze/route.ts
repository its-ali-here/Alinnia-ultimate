import { groq } from "@ai-sdk/groq"
import { generateObject } from "ai"
import { z } from "zod"
import { createSupabaseAdminClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"

export const maxDuration = 60

const AnalysisSchema = z.object({
  feasibility_score: z.number().min(0).max(100).describe("0–100 score: how achievable is the full project at this budget and location"),
  achievable_pct: z.number().min(0).max(100).describe("What percentage of the inspiration look can be achieved within budget"),
  fits_budget: z.array(z.string()).describe("Specific items / finishes that can be achieved within budget (4–7 items)"),
  doesnt_fit_budget: z.array(z.string()).describe("Specific items / finishes that exceed the budget (2–5 items)"),
  summary_text: z.string().describe("One clear sentence summarising what the homeowner can achieve"),
})

const ROOM_LABELS: Record<string, string> = {
  bathroom: "bathroom",
  kitchen: "kitchen",
  bedroom: "bedroom",
  "living-room": "living room",
  outdoor: "outdoor / patio",
  "full-home": "full-home renovation",
  extension: "home extension",
  "multi-room": "multi-room renovation",
}

const US_COST_CONTEXT: Record<string, string> = {
  bathroom: "A basic US bathroom remodel costs $6k–$15k. Mid-range runs $15k–$25k. High-end exceeds $25k.",
  kitchen: "A basic US kitchen remodel costs $10k–$25k. Mid-range runs $25k–$50k. Full custom exceeds $50k.",
  bedroom: "A US bedroom refresh costs $3k–$8k. Full remodel with closets runs $8k–$15k.",
  "living-room": "A US living room remodel costs $5k–$15k. Open-plan conversions with structural work exceed $20k.",
  outdoor: "A US outdoor patio costs $5k–$20k. Pools start at $30k.",
  "full-home": "A full US home renovation costs $100–$200 per sqft depending on finishes.",
  extension: "US home additions cost $150–$300 per sqft.",
  "multi-room": "Multi-room US renovations typically run $30k–$80k depending on scope.",
}

export async function POST(req: Request) {
  let body: {
    roomType: string
    budget: number
    state: string
    city: string
    inspirationText?: string
    currentImagePaths: string[]
    inspirationImagePaths: string[]
    measurements?: { lengthFt: number; widthFt: number; heightFt: number; floorAreaSqft?: number }
    homeType?: string
    currency?: string
    projectName?: string
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const {
    roomType, budget, state, city, inspirationText,
    currentImagePaths, inspirationImagePaths,
    measurements, homeType, currency, projectName,
  } = body

  if (!roomType || !budget || !state || !city) {
    return NextResponse.json({ error: "Missing roomType, budget, or zipCode" }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()
  const sessionId = randomUUID()

  // 1. Create anonymous project row
  const { data: project, error: projectError } = await admin
    .from("projects")
    .insert({
      name: projectName || `${ROOM_LABELS[roomType] ?? roomType} remodel`,
      budget,
      status: "planning",
      room_type: roomType,
      zip_code: `${city}, ${state}`,
      city,
      country: "United Kingdom",
      inspiration_text: inspirationText ?? null,
      session_id: sessionId,
      currency: currency ?? "USD",
      home_type: homeType ?? null,
      total_area: measurements?.floorAreaSqft ?? null,
      user_id: null,
    })
    .select("id")
    .single()

  if (projectError || !project) {
    console.error("Project insert error:", projectError)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }

  const projectId = project.id

  // 2. Store image references
  const imageRows = [
    ...currentImagePaths.map((p, i) => ({
      project_id: projectId,
      session_id: sessionId,
      image_type: "current" as const,
      storage_path: p,
      display_order: i,
    })),
    ...inspirationImagePaths.map((p, i) => ({
      project_id: projectId,
      session_id: sessionId,
      image_type: "inspiration" as const,
      storage_path: p,
      display_order: i,
    })),
  ]

  if (imageRows.length > 0) {
    await admin.from("project_images").insert(imageRows)
  }

  // 3. Generate AI analysis
  const prompt = [
    `A homeowner wants to remodel their ${ROOM_LABELS[roomType] ?? roomType}.`,
    `Budget: ${currency === 'GBP' ? '£' : '$'}${budget.toLocaleString()} ${currency ?? 'USD'}`,
    `Location: ${city}, ${state}`,
    measurements?.lengthFt && measurements?.widthFt
      ? `Room measurements: ${measurements.lengthFt}ft × ${measurements.widthFt}ft × ${measurements.heightFt}ft high` +
        (measurements.floorAreaSqft ? ` (${measurements.floorAreaSqft} sqft floor area)` : '')
      : null,
    homeType ? `Home type: ${homeType}` : null,
    inspirationText ? `They said: "${inspirationText}"` : null,
    inspirationImagePaths.length > 0
      ? `They uploaded ${inspirationImagePaths.length} inspiration photo(s).`
      : null,
    ``,
    `US market context: ${US_COST_CONTEXT[roomType] ?? "Varies by scope and finishes."}`,
    ``,
    `Based on this budget and a typical ${ROOM_LABELS[roomType] ?? roomType} in the US:`,
    `- Calculate a feasibility score (0–100) representing how fully achievable the project is`,
    `- Estimate what percentage of a typical high-end renovation look can be achieved`,
    `- List specific items/finishes that fit the budget`,
    `- List specific items/finishes that won't fit`,
    `- Write one concise summary sentence`,
    ``,
    `Be realistic and specific to the US market. Use dollar amounts where helpful.`,
  ].filter(Boolean).join("\n")

  let analysisData: z.infer<typeof AnalysisSchema>

  try {
    const result = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: AnalysisSchema,
      system: `You are a US renovation expert who gives homeowners an honest, specific assessment of what they can achieve with their budget. Be realistic, specific, and encouraging. Always mention concrete finishes and materials relevant to the room type.`,
      prompt,
    })
    analysisData = result.object
  } catch (aiError: any) {
    console.error("AI analysis error:", aiError)
    // Graceful fallback — basic heuristic analysis
    const pct = budget >= 25000 ? 90 : budget >= 15000 ? 75 : budget >= 8000 ? 55 : 35
    analysisData = {
      feasibility_score: pct,
      achievable_pct: pct,
      fits_budget: ["Standard fixtures and fittings", "Mid-range flooring", "Fresh paint and lighting", "New hardware and accessories"],
      doesnt_fit_budget: ["Premium custom cabinetry", "High-end stone countertops"],
      summary_text: `With $${budget.toLocaleString()} you can achieve a solid ${ROOM_LABELS[roomType] ?? roomType} refresh with mid-range finishes.`,
    }
  }

  // 4. Store analysis
  const { error: analysisError } = await admin.from("renovation_analyses").insert({
    project_id: projectId,
    feasibility_score: analysisData.feasibility_score,
    achievable_pct: analysisData.achievable_pct,
    fits_budget: analysisData.fits_budget,
    doesnt_fit_budget: analysisData.doesnt_fit_budget,
    summary_text: analysisData.summary_text,
    raw_ai_response: analysisData,
  })

  if (analysisError) {
    console.error("Analysis insert error:", analysisError)
    // Non-fatal — still return sessionId so results page can show fallback
  }

  return NextResponse.json({ sessionId, projectId })
}
