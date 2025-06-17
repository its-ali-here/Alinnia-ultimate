"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function SupabaseDebug() {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "success" | "error">("checking")
  const [errorMessage, setErrorMessage] = useState("")
  const [envVars, setEnvVars] = useState({
    url: "",
    hasAnonKey: false,
  })

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    setConnectionStatus("checking")

    // Check environment variables
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    setEnvVars({ url, hasAnonKey })

    try {
      // Test Supabase connection
      const { data, error } = await supabase.auth.getSession()

      if (error && !error.message.includes("not configured")) {
        setConnectionStatus("error")
        setErrorMessage(error.message)
      } else {
        setConnectionStatus("success")
      }
    } catch (error) {
      setConnectionStatus("error")
      setErrorMessage(error.message || "Unknown error")
    }
  }

  const testSignup = async () => {
    try {
      const testEmail = `test-${Date.now()}@example.com`
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: "testpassword123",
        options: {
          data: {
            full_name: "Test User",
          },
        },
      })

      if (error) {
        alert(`Signup test failed: ${error.message}`)
      } else {
        alert("Signup test successful! (Check your Supabase dashboard)")
      }
    } catch (error) {
      alert(`Signup test error: ${error.message}`)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Supabase Connection Debug</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Environment Variables</h3>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                {envVars.url ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">NEXT_PUBLIC_SUPABASE_URL</span>
              </div>
              {envVars.url && <p className="text-xs text-muted-foreground ml-6">{envVars.url}</p>}

              <div className="flex items-center space-x-2">
                {envVars.hasAnonKey ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Connection Status</h3>
            <div className="flex items-center space-x-2">
              {connectionStatus === "checking" && <AlertCircle className="h-4 w-4 text-yellow-500 animate-spin" />}
              {connectionStatus === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
              {connectionStatus === "error" && <XCircle className="h-4 w-4 text-red-500" />}
              <span className="text-sm capitalize">{connectionStatus}</span>
            </div>
            {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
          </div>
        </div>

        {connectionStatus === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>Connection failed. Common issues:</p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  <li>Check if your Supabase URL is correct</li>
                  <li>Verify your anon key is valid</li>
                  <li>Ensure your Supabase project is active</li>
                  <li>Check if authentication is enabled in Supabase</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex space-x-2">
          <Button onClick={checkConnection} variant="outline">
            Recheck Connection
          </Button>
          <Button onClick={testSignup} disabled={connectionStatus !== "success"}>
            Test Signup
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
