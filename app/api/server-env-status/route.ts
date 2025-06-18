import { NextResponse } from "next/server"
import { getServerSideEnvStatus } from "@/lib/env-check"

export async function GET() {
  try {
    const serverStatus = getServerSideEnvStatus()

    // Only expose boolean flags about configuration status to the client.
    // Avoid sending back the actual list of missing server variables unless for specific admin purposes.
    return NextResponse.json({
      isSupabasePublicConfigured: serverStatus.isSupabasePublicConfigured,
      isGroqConfigured: serverStatus.isGroqConfigured, // Status of a server-side var
      // You can add more specific flags here based on serverStatus.missingServerVars if needed
      // For example: isAiFeaturesEnabled: serverStatus.isGroqConfigured
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error in /api/server-env-status:", errorMessage)
    return NextResponse.json({ error: "Failed to retrieve environment status." }, { status: 500 })
  }
}
