"use client"
import { useEffect, useState } from "react"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface EnvStatusState {
  isSupabasePublicConfigured?: boolean
  isGroqConfigured?: boolean
  isLoading: boolean
  error?: string
}

export function EnvStatus() {
  const [status, setStatus] = useState<EnvStatusState>({ isLoading: true })

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await fetch("/api/server-env-status")
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }))
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setStatus({
          isSupabasePublicConfigured: data.isSupabasePublicConfigured,
          isGroqConfigured: data.isGroqConfigured,
          isLoading: false,
        })
      } catch (error) {
        console.error("Failed to fetch env status:", error)
        setStatus({ isLoading: false, error: error instanceof Error ? error.message : String(error) })
      }
    }
    fetchStatus()
  }, [])

  if (status.isLoading) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Checking Configuration...</AlertTitle>
        <AlertDescription>Loading environment status.</AlertDescription>
      </Alert>
    )
  }

  if (status.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Checking Configuration</AlertTitle>
        <AlertDescription>{status.error}</AlertDescription>
      </Alert>
    )
  }

  const allGood = status.isSupabasePublicConfigured && status.isGroqConfigured

  return (
    <Alert variant={allGood ? "default" : "warning"}>
      {allGood ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
      <AlertTitle>{allGood ? "System Configured" : "Configuration Incomplete"}</AlertTitle>
      <AlertDescription>
        {!status.isSupabasePublicConfigured && <div>Supabase (database/auth) is not fully configured.</div>}
        {!status.isGroqConfigured && <div>Groq (AI features) is not configured.</div>}
        {allGood && <div>All essential services are configured.</div>}
      </AlertDescription>
    </Alert>
  )
}
