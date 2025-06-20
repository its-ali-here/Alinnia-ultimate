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
  const { user, organizationId, loading: authLoading, signUp, isSupabaseConfigured } = useAuth()

  // --- STATE MANAGEMENT ---
  const [step, setStep] = useState(1)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Expanded formData state to hold all required details
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    orgType: "new",
    orgName: "",
    orgCode: "",
    orgEmail: "",
    orgPhone: "",
    orgIndustry: "",
    orgCity: "",
    orgCountry: "",
  })

  // Redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push(organizationId ? "/dashboard" : "/auth/organization-setup")
    }
  }, [user, organizationId, authLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }
  
  const handleOrgTypeChange = (value: "new" | "existing") => {
    setFormData(prev => ({ ...prev, orgType: value }));
  };


  // --- FORM NAVIGATION & SUBMISSION ---
  const handleNextStep = () => {
    setError("");
    // --- Step 1 Validation (Personal Details) ---
    if (step === 1) {
      if (!formData.fullName.trim()) return setError("Full name is required.");
      if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) return setError("A valid email is required.");
      if (formData.password.length < 6) return setError("Password must be at least 6 characters long.");
      if (formData.password !== formData.confirmPassword) return setError("Passwords do not match.");
    }
    // --- Step 2 Validation (Org Type & Name/Code) ---
    else if (step === 2) {
      if (formData.orgType === 'new' && !formData.orgName.trim()) {
        return setError("Organization name is required.");
      }
      if (formData.orgType === 'existing' && !formData.orgCode.trim()) {
        return setError("Organization code is required.");
      }
      // If joining, we submit right away.
      if (formData.orgType === 'existing') {
        handleSubmit();
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    setError("");

    // --- Final Validation before API call (for new orgs) ---
    if (formData.orgType === 'new') {
      if (!formData.orgName || !formData.orgEmail || !formData.orgIndustry || !formData.orgCity || !formData.orgCountry) {
        return setError("Please fill out all organization detail fields before finishing.");
      }
    }

    if (!isSupabaseConfigured) {
      return setError("Authentication is not available: Supabase is not configured.");
    }

    setLoading(true);
    try {
      const { error: signupError } = await signUp(formData);
      if (signupError) throw signupError;
      // On success, the useEffect will handle the redirect.
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };


  // --- RENDER LOGIC ---
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign Up - Step {step} of 3</CardTitle>
        <CardDescription>
          {step === 1 && "Create your personal account."}
          {step === 2 && "Tell us about your organization."}
          {step === 3 && "Complete your organization's details to finish."}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Details */}
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
                <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required />
              </div>
            </div>
          )}

          {/* Step 2: Organization Type */}
          {step === 2 && (
             <div className="space-y-6">
              <RadioGroup value={formData.orgType} onValueChange={handleOrgTypeChange} className="space-y-2">
                <Label className="flex items-center space-x-2 p-3 border rounded-lg has-[input:checked]:border-primary cursor-pointer">
                  <RadioGroupItem value="new" id="new" />
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    <span>Create a new organization</span>
                  </div>
                </Label>
                <Label className="flex items-center space-x-2 p-3 border rounded-lg has-[input:checked]:border-primary cursor-pointer">
                  <RadioGroupItem value="existing" id="existing" />
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>Join an existing organization</span>
                  </div>
                </Label>
              </RadioGroup>

              {formData.orgType === "new" ? (
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input id="orgName" value={formData.orgName} onChange={handleInputChange} placeholder="Acme Inc." required />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="orgCode">Organization Code</Label>
                  <Input id="orgCode" value={formData.orgCode} onChange={handleInputChange} placeholder="Enter the 6-character code" required maxLength={6} />
                </div>
              )}
            </div>
          )}
          
          {/* Step 3: New Organization Details */}
          {step === 3 && formData.orgType === 'new' && (
            <div className="space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="orgNameReadOnly">Organization Name</Label>
                  <Input id="orgNameReadOnly" value={formData.orgName} readOnly disabled className="bg-muted"/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgEmail">Organization Email</Label>
                  <Input id="orgEmail" type="email" value={formData.orgEmail} onChange={handleInputChange} placeholder="contact@acme.com" required />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="orgIndustry">Industry</Label>
                  <Input id="orgIndustry" value={formData.orgIndustry} onChange={handleInputChange} placeholder="e.g., Technology" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="orgCity">City</Label>
                      <Input id="orgCity" value={formData.orgCity} onChange={handleInputChange} placeholder="San Francisco" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="orgCountry">Country</Label>
                      <Input id="orgCountry" value={formData.orgCountry} onChange={handleInputChange} placeholder="USA" required />
                    </div>
                </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
              {step > 1 ? (
                <Button type="button" variant="outline" onClick={handlePrevStep} disabled={loading}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : <div />}

              {step < 3 && (
                <Button type="button" onClick={handleNextStep} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {formData.orgType === 'existing' && step === 2 ? 'Join Organization' : 'Next'}
                </Button>
              )}
              
              {step === 3 && formData.orgType === 'new' && (
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Finish Signup
                </Button>
              )}
          </div>

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