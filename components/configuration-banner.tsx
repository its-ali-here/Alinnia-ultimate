"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { isSupabaseConfigured } from "@/lib/supabase"

export function ConfigurationBanner() {
  if (isSupabaseConfigured()) {
    return null
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <strong>Configuration Required:</strong> Supabase environment variables are missing. Authentication and database
        features are disabled. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your
        environment variables.
      </AlertDescription>
    </Alert>
  )
}
