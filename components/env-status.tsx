"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { getEnvironmentStatus } from "@/lib/env-check"

export function EnvStatus() {
  const [mounted, setMounted] = useState(false)
  const [envStatus, setEnvStatus] = useState(getEnvironmentStatus())

  useEffect(() => {
    setMounted(true)
    // Refresh environment status
    setEnvStatus(getEnvironmentStatus())
  }, [])

  if (!mounted) return null

  const envChecks = [
    {
      name: "Supabase URL",
      status: envStatus.supabaseUrl,
      key: "NEXT_PUBLIC_SUPABASE_URL",
    },
    {
      name: "Supabase Anon Key",
      status: envStatus.supabaseAnonKey,
      key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    },
    {
      name: "Groq API Key",
      status: envStatus.groqApiKey,
      key: "GROQ_API_KEY",
    },
  ]

  const allConfigured = envStatus.allConfigured

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {allConfigured ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
          Environment Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {envChecks.map((check) => (
          <div key={check.key} className="flex items-center justify-between">
            <span className="font-medium">{check.name}</span>
            <div className="flex items-center gap-2">
              {check.status ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Configured
                  </Badge>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <Badge variant="destructive">Missing</Badge>
                </>
              )}
            </div>
          </div>
        ))}

        {!allConfigured && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Missing Environment Variables:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
              {envStatus.missing.map((varName) => (
                <li key={varName}>{varName}</li>
              ))}
            </ul>
            <div className="mt-3">
              <h5 className="font-semibold text-yellow-800 mb-1">Setup Instructions:</h5>
              <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-700">
                <li>
                  Create a <code>.env.local</code> file in your project root
                </li>
                <li>Add the missing environment variables</li>
                <li>Restart your development server</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
