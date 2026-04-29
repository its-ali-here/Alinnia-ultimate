import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export const maxDuration = 30

export async function POST(req: Request) {
  // 1. Verify the user is authenticated (uses session cookie, not admin client)
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // 2. Parse multipart form data
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  const file = formData.get("file") as File | null
  const projectId = formData.get("project_id") as string | null
  const fileType = formData.get("file_type") as string | null

  if (!file || !projectId || !fileType) {
    return NextResponse.json({ error: "Missing file, project_id, or file_type" }, { status: 400 })
  }

  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 50 MB)" }, { status: 400 })
  }

  // 3. Upload to Supabase Storage via admin client — bypasses bucket RLS policies
  const admin = createSupabaseAdminClient()
  const safeName = `${projectId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`

  const bytes = await file.arrayBuffer()

  const { data: uploadData, error: uploadError } = await admin.storage
    .from("documents")
    .upload(safeName, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    })

  if (uploadError) {
    console.error("Storage upload error:", uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  // 4. Insert record into documents table
  const { data: doc, error: dbError } = await admin
    .from("documents")
    .insert({
      project_id: projectId,
      file_name: file.name,
      file_path: uploadData.path,
      file_type: fileType,
      uploaded_by: user.id,
    })
    .select()
    .single()

  if (dbError) {
    // Clean up the uploaded file so storage and DB don't drift
    await admin.storage.from("documents").remove([uploadData.path])
    console.error("Document insert error:", dbError)
    return NextResponse.json({ error: dbError.message }, { status: 500 })
  }

  return NextResponse.json(doc)
}
