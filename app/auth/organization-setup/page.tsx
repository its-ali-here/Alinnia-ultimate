"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { createOrganizationAndLinkUser, joinOrganizationAndLinkUser } from "@/lib/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Building2, Users, AlertCircle, Loader2 } from "lucide-react"

export default function OrganizationSetupPage() {
  const { user, organizationId, loading: authLoading, refreshOrganization, isSupabaseConfigured } = useAuth()
  const router = useRouter()
  const [orgType, setOrgType] = useState<"new" | "existing">("new")
  const [orgName, setOrgName] = useState("")
  const [orgId, setOrgId] = useState("")
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

  const handleOrganizationAction = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!user) {
      setError("User not authenticated.")
      return
    }
    if (!isSupabaseConfigured) {
      setError("Authentication is not available: Supabase is not configured.")
      return
    }

    setLoading(true)
    try {
      if (orgType === "new") {
        if (!orgName.trim()) {
          setError("Organization name cannot be empty.")
          setLoading(false)
          return
        }
        await createOrganizationAndLinkUser(user.id, orgName)
      } else {
        if (!orgId.trim()) {
          setError("Organization ID cannot be empty.")
          setLoading(false)
          return
        }
        await joinOrganizationAndLinkUser(user.id, orgId)
      }
      await refreshOrganization() // Refresh the organization ID in context
      // Redirection will be handled by the useEffect after organizationId is updated
    } catch (err) {
      console.error("Error setting up organization:", err)
      setError((err as Error).message || "Failed to set up organization.")
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
          <CardTitle>Set Up Your Organization</CardTitle>
          <CardDescription>Create a new organization or join an existing one to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          {!isSupabaseConfigured && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Authentication is not available: Supabase environment variables are missing. Please configure
                NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
              </AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleOrganizationAction} className="space-y-6">
            <RadioGroup value={orgType} onValueChange={(v) => setOrgType(v as any)} className="space-y-2">
              <Label className="flex items-center space-x-2 p-3 border rounded-lg has-[input:checked]:border-primary">
                <RadioGroupItem value="new" id="new" />
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  <span>Create a new organization</span>
                </div>
              </Label>
              <Label className="flex items-center space-x-2 p-3 border rounded-lg has-[input:checked]:border-primary">
                <RadioGroupItem value="existing" id="existing" />
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>Join an existing organization</span>
                </div>
              </Label>
            </RadioGroup>

            {orgType === "new" ? (
              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name</Label>
                <Input
                  id="organizationName"
                  type="text"
                  placeholder="e.g., My Business Inc."
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="organizationId">Organization ID</Label>
                <Input
                  id="organizationId"
                  type="text"
                  placeholder="Paste the organization UUID here"
                  value={orgId}
                  onChange={(e) => setOrgId(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {orgType === "new" ? "Creating Organization..." : "Joining Organization..."}
                </>
              ) : orgType === "new" ? (
                "Create Organization"
              ) : (
                "Join Organization"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
