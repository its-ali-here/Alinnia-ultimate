import { createSupabaseAdminClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params

  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()

  const { data: project, error: projectError } = await admin
    .from("projects")
    .select("id, name, budget, room_type, zip_code, guide_purchased, session_id")
    .eq("session_id", sessionId)
    .single()

  if (projectError || !project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const { data: analysis } = await admin
    .from("renovation_analyses")
    .select("id, feasibility_score, achievable_pct, fits_budget, doesnt_fit_budget, summary_text")
    .eq("project_id", project.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  return NextResponse.json({ project, analysis })
}
