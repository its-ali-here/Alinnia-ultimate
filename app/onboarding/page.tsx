"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { createOrganization } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

export default function OnboardingPage() {
  const { user, organizationId, loading: authLoading, refreshOrganization } = useAuth()
  const router = useRouter()
  const [organizationName, setOrganizationName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // If not logged in, redirect to login page
        router.push("/auth/login?message=Please log in to continue.")
      } else if (organizationId) {
        // If already has an organization, redirect to dashboard
        router.push("/dashboard")
      }
    }
  }, [user, organizationId, authLoading, router])

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!user) {
      setError("User not authenticated.")
      return
    }
    if (!organizationName.trim()) {
      setError("Organization name cannot be empty.")
      return
    }

    setLoading(true)
    try {
      await createOrganization(user.id, organizationName)
      await refreshOrganization() // Refresh the organization ID in context
      // Redirection will be handled by the useEffect after organizationId is updated
    } catch (err) {
      console.error("Error creating organization:", err)
      setError((err as Error).message || "Failed to create organization.")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || (!user && !authLoading) || (user && organizationId && !authLoading)) {
    // Show a loading spinner or null while auth state is resolving or redirecting
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Alinnia!</CardTitle>
          <CardDescription>Create your first organization to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleCreateOrganization} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="organizationName">Organization Name</Label>
              <Input
                id="organizationName"
                type="text"
                placeholder="e.g., My Business Inc."
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Organization...
                </>
              ) : (
                "Create Organization"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
