import { createSupabaseAdminClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()

  const { data: project, error: projectError } = await admin
    .from("projects")
    .select("id, name, budget, guide_purchased")
    .eq("id", projectId)
    .single()

  if (projectError || !project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (!project.guide_purchased) {
    return NextResponse.json({ error: "Not purchased" }, { status: 403 })
  }

  const { data: guide } = await admin
    .from("renovation_guides")
    .select("materials_list, work_sequence, contractors_needed, quote_questions, red_flags")
    .eq("project_id", projectId)
    .maybeSingle()

  return NextResponse.json({ project, guide })
}
