"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Building2, Users, AlertCircle, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress" // --- CHANGE 1: Import Progress component ---

export function SignupForm() {
  const router = useRouter()
  const { signUp, isSupabaseConfigured } = useAuth()
  
  const [step, setStep] = useState(1)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false) // --- CHANGE 2: State for success UI ---

  const [formData, setFormData] = useState({
    fullName: "", email: "", password: "", confirmPassword: "", designation: "", orgType: "new",
    orgName: "", orgCode: "", orgEmail: "", orgIndustry: "", orgCity: "", orgCountry: "",
  })

  // The rest of the handlers remain largely the same...
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }
  
  const handleOrgTypeChange = (value: "new" | "existing") => {
    setFormData(prev => ({ ...prev, orgType: value }));
  };

  const handleNextStep = () => {
    setError("");
    if (step === 1) {
      if (!formData.fullName.trim()) return setError("Full name is required.");
      if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) return setError("A valid email is required.");
      if (formData.password.length < 6) return setError("Password must be at least 6 characters long.");
      if (formData.password !== formData.confirmPassword) return setError("Passwords do not match.");
    }
    else if (step === 2) {
      if (formData.orgType === 'new' && !formData.orgName.trim()) return setError("Organization name is required.");
      if (formData.orgType === 'existing' && !formData.orgCode.trim()) return setError("Organization code is required.");
      if (formData.orgType === 'existing') {
        handleSubmit();
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => { setStep(step - 1) };

  const handleSubmit = async (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    setError("");

    if (formData.orgType === 'new') {
      if (!formData.orgName || !formData.orgEmail || !formData.orgIndustry || !formData.orgCity || !formData.orgCountry) {
        return setError("Please fill out all organization detail fields before finishing.");
      }
    }
    if (!isSupabaseConfigured) return setError("Authentication is not available.");

    setLoading(true);
    try {
      const { error: signupError } = await signUp(formData);
      if (signupError) throw signupError;
      
      // --- CHANGE 3: On success, show the success message ---
      setSignupSuccess(true);

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER LOGIC ---

  // --- CHANGE 4: The Success UI ---
  if (signupSuccess) {
    return (
        <Card className="w-full max-w-md mx-auto">
            <CardContent className="pt-8 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Registration Successful!</h2>
                <p className="text-muted-foreground mb-6">
                    A verification link has been sent to your email. Please verify your account before logging in.
                </p>
                <Button asChild className="w-full">
                    <Link href="/auth/login">Proceed to Login</Link>
                </Button>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign Up - Step {step} of 3</CardTitle>
        <CardDescription>
          {step === 1 && "Create your personal account."}
          {step === 2 && "Tell us about your organization."}
          {step === 3 && "Complete your organization's details to finish."}
        </CardDescription>
        {/* --- CHANGE 5: The Progress Bar --- */}
        <Progress value={(step / 3) * 100} className="mt-2" />
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* --- CHANGE 6: Added placeholder text to all inputs --- */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2"><Label htmlFor="fullName">Full Name</Label><Input id="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="e.g., John Doe" required /></div>
              <div className="space-y-2"><Label htmlFor="designation">Designation</Label><Input id="designation" value={formData.designation} onChange={handleInputChange} placeholder="e.g., Finance Director" required /></div>
              <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="e.g., john.doe@example.com" required /></div>
              <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" type="password" value={formData.password} onChange={handleInputChange} placeholder="6+ characters" required /></div>
              <div className="space-y-2"><Label htmlFor="confirmPassword">Confirm Password</Label><Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} placeholder="Re-enter your password" required /></div>
            </div>
          )}
          {step === 2 && ( <div className="space-y-6"> <RadioGroup value={formData.orgType} onValueChange={handleOrgTypeChange} className="space-y-2"> <Label className="flex items-center space-x-2 p-3 border rounded-lg has-[input:checked]:border-primary cursor-pointer"> <RadioGroupItem value="new" id="new" /> <div className="flex items-center gap-2"><Building2 className="h-5 w-5" /><span>Create a new organization</span></div> </Label> <Label className="flex items-center space-x-2 p-3 border rounded-lg has-[input:checked]:border-primary cursor-pointer"> <RadioGroupItem value="existing" id="existing" /> <div className="flex items-center gap-2"><Users className="h-5 w-5" /><span>Join an existing organization</span></div> </Label> </RadioGroup> {formData.orgType === "new" ? (<div className="space-y-2"><Label htmlFor="orgName">Organization Name</Label><Input id="orgName" value={formData.orgName} onChange={handleInputChange} placeholder="e.g., Acme Inc." required /></div>) : (<div className="space-y-2"><Label htmlFor="orgCode">Organization Code</Label><Input id="orgCode" value={formData.orgCode} onChange={handleInputChange} placeholder="Enter the 6-character code" required maxLength={6} /></div>)} </div> )}
          {step === 3 && formData.orgType === 'new' && (
            <div className="space-y-4">
                 <div className="space-y-2"><Label htmlFor="orgNameReadOnly">Organization Name</Label><Input id="orgNameReadOnly" value={formData.orgName} readOnly disabled className="bg-muted"/></div>
                 <div className="space-y-2"><Label htmlFor="orgEmail">Organization Email</Label><Input id="orgEmail" type="email" value={formData.orgEmail} onChange={handleInputChange} placeholder="e.g., contact@acme.com" required /></div>
                 <div className="space-y-2"><Label htmlFor="orgIndustry">Industry</Label><Input id="orgIndustry" value={formData.orgIndustry} onChange={handleInputChange} placeholder="e.g., Technology" required /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label htmlFor="orgCity">City</Label><Input id="orgCity" value={formData.orgCity} onChange={handleInputChange} placeholder="e.g., San Francisco" required /></div>
                    <div className="space-y-2"><Label htmlFor="orgCountry">Country</Label><Input id="orgCountry" value={formData.orgCountry} onChange={handleInputChange} placeholder="e.g., USA" required /></div>
                </div>
            </div>
          )}
          <div className="flex justify-between mt-8">
              {step > 1 ? (<Button type="button" variant="outline" onClick={handlePrevStep} disabled={loading}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>) : <div />}
              {step < 3 && (<Button type="button" onClick={handleNextStep} disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (formData.orgType === 'existing' && step === 2 ? 'Join Organization' : 'Next')}</Button>)}
              {(step === 3 && formData.orgType === 'new') && (<Button type="submit" disabled={loading}>{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Finish Signup</Button>)}
          </div>
        </form>
        <p className="text-sm text-muted-foreground text-center mt-4">Already have an account? <Link href="/auth/login" className="text-primary hover:underline">Login</Link></p>
      </CardContent>
    </Card>
  )
}