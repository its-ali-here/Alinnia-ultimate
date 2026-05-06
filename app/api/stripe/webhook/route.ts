import { stripe } from "@/lib/stripe"
import { createSupabaseAdminClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"
import type Stripe from "stripe"

export const maxDuration = 30

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  const admin = createSupabaseAdminClient()

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const projectId = session.metadata?.project_id
    const paymentIntentId = session.payment_intent as string | null

    if (!projectId) {
      console.error("No project_id in session metadata")
      return NextResponse.json({ received: true })
    }

    // Mark guide as purchased
    await admin
      .from("projects")
      .update({ guide_purchased: true, guide_purchased_at: new Date().toISOString() })
      .eq("id", projectId)

    // Update payment status
    if (paymentIntentId) {
      await admin
        .from("payments")
        .update({ status: "succeeded" })
        .eq("stripe_payment_intent_id", paymentIntentId)
    }

    // Trigger guide generation (fire and forget — guide page will poll)
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/guide/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-webhook-secret": process.env.STRIPE_WEBHOOK_SECRET! },
      body: JSON.stringify({ projectId }),
    }).catch((e) => console.error("Guide generation trigger failed:", e))
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent
    await admin
      .from("payments")
      .update({ status: "failed" })
      .eq("stripe_payment_intent_id", pi.id)
  }

  return NextResponse.json({ received: true })
}
