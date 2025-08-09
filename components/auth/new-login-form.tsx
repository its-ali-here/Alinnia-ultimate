"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { AuthCheckingScreen, OrganizationCheckingScreen } from "@/components/auth/auth-loading-screen"

export function NewLoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [checkingOrganization, setCheckingOrganization] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const message = searchParams.get("message")
  const { isSupabaseConfigured, user, loading: authLoading } = useAuth()

  // Handle routing after successful login
  useEffect(() => {
    if (!authLoading && user && !checkingOrganization) {
      checkUserOrganization()
    }
  }, [user, authLoading, checkingOrganization])

  const checkUserOrganization = async () => {
    if (!user) return
    
    setCheckingOrganization(true)
    try {
      // Check if user has an organization
      const { data, error } = await supabase
        .from("organization_members")
        .select("organization_id, role")
        .eq("user_id", user.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error("Error checking organization:", error)
        // If there's an error, assume no organization and go to organization setup
        router.push("/auth/organization-setup")
        return
      }

      if (data && data.organization_id) {
        // User has an organization, go to dashboard
        router.push("/dashboard")
      } else {
        // User has no organization, go to organization setup
        router.push("/auth/organization-setup")
      }
    } catch (error) {
      console.error("Error checking organization:", error)
      router.push("/auth/organization-setup")
    } finally {
      setCheckingOrganization(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!isSupabaseConfigured) {
      setError("Authentication is not available: Supabase is not configured")
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else if (data.user) {
        // The useEffect will handle routing after login
      }
    } catch (error) {
      setError("An unexpected error occurred")
      console.error("Login error:", error)
    } finally {
      setLoading(false)
    }
  }

  // Show loading screen while checking auth state
  if (authLoading) {
    return <AuthCheckingScreen />
  }

  // Show loading screen while checking organization
  if (checkingOrganization) {
    return <OrganizationCheckingScreen />
  }

  // If user is already logged in, don't show the form
  if (user) {
    return <OrganizationCheckingScreen />
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>
          Sign in to your Alinnia account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {message && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </div>

          <div className="text-center">
            <Link 
              href="/auth/forgot-password" 
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Forgot your password?
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
