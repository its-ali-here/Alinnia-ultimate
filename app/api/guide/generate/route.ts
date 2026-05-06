import { groq } from "@ai-sdk/groq"
import { generateObject } from "ai"
import { z } from "zod"
import { createSupabaseAdminClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export const maxDuration = 60

const GuideSchema = z.object({
  materials_list: z.array(z.object({
    item: z.string(),
    qty: z.string(),
    unit: z.string(),
    est_cost: z.string(),
  })).describe("Itemised materials list with quantities and estimated costs"),
  work_sequence: z.array(z.object({
    step: z.number(),
    title: z.string(),
    description: z.string(),
    why: z.string(),
  })).describe("Step-by-step work sequence explaining what happens and why"),
  contractors_needed: z.array(z.object({
    trade: z.string(),
    when: z.string(),
    notes: z.string(),
  })).describe("Contractors needed, when to hire them, and key notes"),
  quote_questions: z.array(z.string()).describe("Questions to ask contractors when getting quotes (6–10 items)"),
  red_flags: z.array(z.string()).describe("Red flags to watch for before signing contracts (5–8 items)"),
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

export async function POST(req: Request) {
  // Secure internal calls from webhook
  const secret = req.headers.get("x-webhook-secret")
  if (secret !== process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { projectId: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { projectId } = body
  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()

  // Fetch project + analysis
  const { data: project } = await admin
    .from("projects")
    .select("id, name, budget, room_type, zip_code, inspiration_text, guide_purchased")
    .eq("id", projectId)
    .single()

  if (!project?.guide_purchased) {
    return NextResponse.json({ error: "Guide not purchased" }, { status: 403 })
  }

  // Check if guide already generated
  const { data: existing } = await admin
    .from("renovation_guides")
    .select("id")
    .eq("project_id", projectId)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ guideId: existing.id })
  }

  const { data: analysis } = await admin
    .from("renovation_analyses")
    .select("fits_budget, doesnt_fit_budget, summary_text")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const roomLabel = ROOM_LABELS[project.room_type] ?? project.room_type

  const prompt = [
    `Generate a complete renovation guide for a US homeowner.`,
    `Room: ${roomLabel}`,
    `Budget: $${Number(project.budget).toLocaleString()}`,
    `ZIP code: ${project.zip_code}`,
    project.inspiration_text ? `What they want: "${project.inspiration_text}"` : null,
    analysis?.fits_budget
      ? `Items that fit budget: ${(analysis.fits_budget as string[]).join(", ")}`
      : null,
    ``,
    `Provide:`,
    `1. A detailed materials list with specific quantities and US market cost estimates`,
    `2. A step-by-step work sequence (in the correct construction order) explaining each step`,
    `3. Contractors needed at each stage`,
    `4. 8 specific questions to ask when getting quotes`,
    `5. 6 red flags to watch for in contracts and contractor behaviour`,
    ``,
    `Be specific to the US market, realistic about costs, and practical.`,
  ].filter(Boolean).join("\n")

  let guideData: z.infer<typeof GuideSchema>

  try {
    const result = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: GuideSchema,
      system: `You are a veteran US general contractor and renovation advisor. You write practical, specific renovation guides for homeowners in plain English. Include real product types, contractor trades, and realistic US pricing.`,
      prompt,
    })
    guideData = result.object
  } catch (err) {
    console.error("Guide generation error:", err)
    return NextResponse.json({ error: "Guide generation failed" }, { status: 500 })
  }

  // Build project tracker seed data from work sequence
  const projectTracker = {
    phases: guideData.work_sequence.map((s, i) => ({
      name: s.title,
      description: s.description,
      order: i + 1,
    })),
  }

  const { data: guide, error: insertError } = await admin
    .from("renovation_guides")
    .insert({
      project_id: projectId,
      materials_list: guideData.materials_list,
      work_sequence: guideData.work_sequence,
      contractors_needed: guideData.contractors_needed,
      quote_questions: guideData.quote_questions,
      red_flags: guideData.red_flags,
      project_tracker: projectTracker,
    })
    .select("id")
    .single()

  if (insertError) {
    console.error("Guide insert error:", insertError)
    return NextResponse.json({ error: "Failed to save guide" }, { status: 500 })
  }

  return NextResponse.json({ guideId: guide.id })
}
