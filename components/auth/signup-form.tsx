"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface SignupFormProps {
  className?: string
}

export function SignupForm({ className }: SignupFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { isSupabaseConfigured, user, organizationId, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && user) {
      if (organizationId) {
        router.push("/dashboard")
      } else {
        router.push("/onboarding")
      }
    }
  }, [user, organizationId, authLoading, router])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
        toast.error(error.message)
      } else if (data.user) {
        // Redirection is now handled by the useEffect hook
        // No direct router.push here
      }
    } catch (error) {
      setError("An unexpected error occurred during signup.")
      console.error("Signup error:", error)
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("grid gap-6", className)}>
      <form onSubmit={handleSignup}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button disabled={loading}>{loading ? "Loading" : "Sign Up with Email"}</Button>
        </div>
      </form>
    </div>
  )
}
