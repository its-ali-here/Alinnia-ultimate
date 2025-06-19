"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Building2, Users, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export function SignupForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [orgType, setOrgType] = useState<"new" | "existing">("new")

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    orgName: "",
    orgId: "",
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { user, organizationId, loading: authLoading, signUp, isSupabaseConfigured } = useAuth()

  // Redirect logic: If user is logged in and has an organization, go to dashboard.
  // This useEffect will now correctly pick up the organizationId set by the signUp function.
  useEffect(() => {
    if (!authLoading && user) {
      if (organizationId) {
        router.push("/dashboard")
      } else {
        // If for some reason a user logs in without an organization (e.g., old user, or error during org creation)
        // they will be redirected to the organization setup page.
        router.push("/auth/organization-setup")
      }
    }
  }, [user, organizationId, authLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.fullName.trim()) {
        setError("Full name is required.")
        return
      }
      if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
        setError("A valid email is required.")
        return
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long.")
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.")
        return
      }
      setError("")
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!isSupabaseConfigured) {
      setError("Authentication is not available: Supabase is not configured.")
      setLoading(false)
      return
    }

    // Validate step 2 fields before submitting
    if (orgType === "new" && !formData.orgName.trim()) {
      setError("Organization name is required.")
      setLoading(false)
      return
    }
    if (orgType === "existing" && !formData.orgId.trim()) {
      setError("Organization ID is required.")
      setLoading(false)
      return
    }

    try {
      // Use the comprehensive signUp function from AuthContext
      const { error: signupError } = await signUp({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        orgType: orgType,
        orgName: orgType === "new" ? formData.orgName : undefined,
        orgId: orgType === "existing" ? formData.orgId : undefined,
      })

      if (signupError) {
        throw signupError
      }

      // Redirection is now handled by the useEffect hook after auth state changes and organizationId is set
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create your account and set up your organization</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
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

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={formData.fullName} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <Button type="button" className="w-full" onClick={handleNext}>
                Next
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Organization Details</h2>
                <p className="text-muted-foreground mt-1">Create a new organization or join one.</p>
              </div>
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
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    value={formData.orgName}
                    onChange={handleInputChange}
                    placeholder="Acme Inc."
                    required
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="orgId">Organization ID</Label>
                  <Input
                    id="orgId"
                    value={formData.orgId}
                    onChange={handleInputChange}
                    placeholder="Paste the organization UUID here"
                    required
                  />
                </div>
              )}
              <div className="flex justify-between mt-8">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Finish Signup
                </Button>
              </div>
            </div>
          )}
        </form>
        <p className="text-sm text-muted-foreground text-center mt-4">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
