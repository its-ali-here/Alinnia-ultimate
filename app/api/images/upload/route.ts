import { createSupabaseAdminClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export const maxDuration = 30

export async function POST(req: Request) {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 })
  }

  const file = formData.get("file") as File | null
  const imageType = formData.get("image_type") as string | null

  if (!file || !imageType) {
    return NextResponse.json({ error: "Missing file or image_type" }, { status: 400 })
  }

  if (!["current", "inspiration"].includes(imageType)) {
    return NextResponse.json({ error: "image_type must be current or inspiration" }, { status: 400 })
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image" }, { status: 400 })
  }

  if (file.size > 20 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 20 MB)" }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()
  const safeName = `${imageType}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
  const bytes = await file.arrayBuffer()

  const { data, error } = await admin.storage
    .from("project-images")
    .upload(safeName, bytes, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    console.error("Image upload error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ path: data.path })
}
