import { stripe, GUIDE_PRICE_CENTS } from "@/lib/stripe"
import { createSupabaseAdminClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export const maxDuration = 30

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

export async function POST(req: Request) {
  let body: { projectId: string; sessionId: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { projectId, sessionId } = body
  if (!projectId || !sessionId) {
    return NextResponse.json({ error: "Missing projectId or sessionId" }, { status: 400 })
  }

  // Verify project exists and hasn't already been purchased
  const admin = createSupabaseAdminClient()
  const { data: project, error } = await admin
    .from("projects")
    .select("id, name, guide_purchased, session_id")
    .eq("id", projectId)
    .single()

  if (error || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  if (project.guide_purchased) {
    return NextResponse.json({ url: `${BASE_URL}/guide/${projectId}` })
  }

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: GUIDE_PRICE_CENTS,
          product_data: {
            name: "Complete Renovation Guide",
            description: `Your personalised ${project.name} guide — materials, sequence, contractors & project tracker`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${BASE_URL}/guide/${projectId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${BASE_URL}/results/${sessionId}`,
    metadata: {
      project_id: projectId,
      session_id: sessionId,
    },
  })

  // Create a pending payment record
  await admin.from("payments").insert({
    project_id: projectId,
    stripe_payment_intent_id: session.payment_intent as string | null,
    amount_cents: GUIDE_PRICE_CENTS,
    currency: "usd",
    status: "pending",
  })

  return NextResponse.json({ url: session.url })
}
