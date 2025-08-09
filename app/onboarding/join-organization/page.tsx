"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Users, Loader2, AlertCircle } from "lucide-react"
import { AuthCheckingScreen } from "@/components/auth/auth-loading-screen"
import Link from "next/link"

export default function JoinOrganizationPage() {
  const { user, loading: authLoading, refreshOrganization } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const [formData, setFormData] = useState({
    orgCode: "",
    designation: "",
  })

  // Redirect if not authenticated
  if (!authLoading && !user) {
    router.push("/auth/login")
    return null
  }

  // Show loading while checking auth
  if (authLoading) {
    return <AuthCheckingScreen />
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.orgCode.trim()) {
      setError("Organization code is required.")
      return
    }

    if (!formData.designation.trim()) {
      setError("Designation is required.")
      return
    }

    setLoading(true)
    try {
      // Join the organization
      const response = await fetch("/api/organization/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          orgCode: formData.orgCode.toUpperCase(),
          designation: formData.designation,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "Failed to join organization.")
      }

      // Refresh organization context and redirect to dashboard
      await refreshOrganization()
      router.push("/dashboard")
      
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Join Organization</h1>
          <p className="text-muted-foreground">
            Enter your organization code and designation to join your team
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              Get the organization code from your administrator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="orgCode">Organization Code</Label>
                <Input
                  id="orgCode"
                  type="text"
                  placeholder="Enter 6-character code (e.g., ABC123)"
                  value={formData.orgCode}
                  onChange={handleInputChange}
                  disabled={loading}
                  maxLength={6}
                  className="uppercase"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  This is a unique 6-character code provided by your organization
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Your Designation</Label>
                <Input
                  id="designation"
                  type="text"
                  placeholder="e.g., Marketing Manager, Sales Rep, Analyst"
                  value={formData.designation}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Your role or job title within the organization
                </p>
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/auth/organization-setup")}
                  disabled={loading}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Join Organization"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Don't have an organization code?{" "}
            <Link
              href="/auth/organization-setup"
              className="font-medium text-primary hover:underline"
            >
              Create a new organization
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
