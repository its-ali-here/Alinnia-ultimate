import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { sessionId: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { sessionId } = body
  if (!sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()

  const { data: project, error } = await admin
    .from("projects")
    .update({ user_id: user.id, session_id: null })
    .eq("session_id", sessionId)
    .is("user_id", null)
    .select("id")
    .single()

  if (error || !project) {
    return NextResponse.json({ error: "Project not found or already claimed" }, { status: 404 })
  }

  return NextResponse.json({ projectId: project.id })
}
