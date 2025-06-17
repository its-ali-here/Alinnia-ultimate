"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, ArrowRight, Building2, Users, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getOrganizationByCode } from "@/lib/database"
import { useAuth } from "@/contexts/auth-context"

interface OrganizationData {
  name: string
  email: string
  phone: string
  industry: string
  city: string
  country: string
}

interface UserData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
}

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Real Estate",
  "Consulting",
  "Marketing",
  "Non-profit",
  "Other",
]

const countries = [
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Australia",
  "Japan",
  "India",
  "Brazil",
  "Mexico",
  "Other",
]

export function SignupForm() {
  const { isSupabaseConfigured } = useAuth()
  const [step, setStep] = useState(1)
  const [organizationType, setOrganizationType] = useState<"new" | "existing" | "">("")
  const [organizationCode, setOrganizationCode] = useState("")
  const [organizationData, setOrganizationData] = useState<OrganizationData>({
    name: "",
    email: "",
    phone: "",
    industry: "",
    city: "",
    country: "",
  })
  const [userData, setUserData] = useState<UserData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [generatedCode, setGeneratedCode] = useState("")
  const router = useRouter()

  const clearError = (field: string) => {
    setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (!organizationType) {
      newErrors.organizationType = "Please select an option"
    }
    if (organizationType === "existing" && !organizationCode.trim()) {
      newErrors.organizationCode = "Organization code is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    if (organizationType === "new") {
      if (!organizationData.name.trim()) newErrors.orgName = "Organization name is required"
      if (!organizationData.email.trim()) newErrors.orgEmail = "Organization email is required"
      else if (!/\S+@\S+\.\S+/.test(organizationData.email)) newErrors.orgEmail = "Invalid email"
      if (!organizationData.industry) newErrors.industry = "Industry is required"
      if (!organizationData.city.trim()) newErrors.city = "City is required"
      if (!organizationData.country) newErrors.country = "Country is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {}
    if (!userData.fullName.trim()) newErrors.fullName = "Full name is required"
    if (!userData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(userData.email)) newErrors.email = "Invalid email"
    if (userData.password.length < 6) newErrors.password = "Password must be at least 6 characters"
    if (userData.password !== userData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    if (step === 1 && validateStep1()) {
      if (organizationType === "existing") {
        try {
          await getOrganizationByCode(organizationCode)
          setStep(3)
        } catch (error) {
          setErrors({ organizationCode: "Invalid organization code" })
        }
      } else {
        setStep(2)
      }
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    } else if (step === 3 && validateStep3()) {
      await handleSignup()
    }
  }

  const handleBack = () => {
    setStep((prev) => (prev === 3 && organizationType === "existing" ? 1 : prev - 1))
  }

  const handleSignup = async () => {
    if (!isSupabaseConfigured) {
      setErrors({ general: "Authentication is not configured." })
      return
    }

    setLoading(true)
    setErrors({})

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    })

    if (signUpError) {
      setErrors({ general: signUpError.message })
      setLoading(false)
      return
    }

    if (!signUpData.user) {
        setErrors({ general: "Failed to create user. Please try again." });
        setLoading(false);
        return;
    }

    // Offload the rest of the work to a separate API route
    const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: signUpData.user.id,
            fullName: userData.fullName,
            organizationType,
            organizationCode,
            organizationData,
        }),
    });

    const result = await response.json();

    if (!response.ok) {
        setErrors({ general: result.error || "An unexpected error occurred after signup." });
        setLoading(false)
        return
    }

    if (organizationType === 'new') {
        setGeneratedCode(result.organizationCode);
        setStep(4);
    } else {
        router.push("/auth/login?message=Account created! Please check your email to verify your account.");
    }

    setLoading(false)
  }

  const getProgress = () => {
    if (organizationType === "existing") {
      return step === 1 ? 33 : step === 3 ? 66 : 100
    }
    return (step / 4) * 100
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <Progress value={getProgress()} className="w-full" />
      </CardHeader>
      <CardContent>
        {errors.general && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}

        {step === 1 && (
            // Step 1 content remains the same
            <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Welcome to Alinnia</h2>
                <p className="text-muted-foreground mt-2">Let's get you set up with your organization</p>
            </div>
            <div className="space-y-4">
                <Label>Choose an option:</Label>
                <RadioGroup value={organizationType} onValueChange={(value) => { setOrganizationType(value as "new" | "existing"); clearError("organizationType"); }}>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent">
                    <RadioGroupItem value="new" id="new" />
                    <Label htmlFor="new" className="flex items-center cursor-pointer flex-1">
                    <Building2 className="mr-3 h-5 w-5" />
                    <div>
                        <div className="font-medium">Create a new organization</div>
                        <div className="text-sm text-muted-foreground">Start fresh with your own organization</div>
                    </div>
                    </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent">
                    <RadioGroupItem value="existing" id="existing" />
                    <Label htmlFor="existing" className="flex items-center cursor-pointer flex-1">
                    <Users className="mr-3 h-5 w-5" />
                    <div>
                        <div className="font-medium">Join an existing organization</div>
                        <div className="text-sm text-muted-foreground">Use an organization code to join</div>
                    </div>
                    </Label>
                </div>
                </RadioGroup>
                {errors.organizationType && <p className="text-sm text-red-600">{errors.organizationType}</p>}
            </div>
            {organizationType === "existing" && (
                <div className="space-y-2">
                <Label htmlFor="orgCode">Organization Code</Label>
                <Input id="orgCode" placeholder="Enter 6-character code" value={organizationCode} onChange={(e) => { setOrganizationCode(e.target.value.toUpperCase()); clearError("organizationCode"); }} maxLength={6} />
                {errors.organizationCode && <p className="text-sm text-red-600">{errors.organizationCode}</p>}
                </div>
            )}
            </div>
        )}
        {step === 2 && (
             // Step 2 content remains the same
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Organization Details</h2>
                    <p className="text-muted-foreground mt-2">Tell us about your organization</p>
                </div>
                <div className="grid gap-4">
                    <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name *</Label>
                    <Input id="orgName" placeholder="Enter organization name" value={organizationData.name} onChange={(e) => { setOrganizationData((prev) => ({ ...prev, name: e.target.value })); clearError("orgName"); }} />
                    {errors.orgName && <p className="text-sm text-red-600">{errors.orgName}</p>}
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="orgEmail">Organization Email *</Label>
                    <Input id="orgEmail" type="email" placeholder="contact@organization.com" value={organizationData.email} onChange={(e) => { setOrganizationData((prev) => ({ ...prev, email: e.target.value })); clearError("orgEmail"); }} />
                    {errors.orgEmail && <p className="text-sm text-red-600">{errors.orgEmail}</p>}
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="orgPhone">Phone Number (Optional)</Label>
                    <Input id="orgPhone" type="tel" placeholder="+1 (555) 123-4567" value={organizationData.phone} onChange={(e) => setOrganizationData((prev) => ({ ...prev, phone: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Select value={organizationData.industry} onValueChange={(value) => { setOrganizationData((prev) => ({ ...prev, industry: value })); clearError("industry"); }} >
                        <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                        <SelectContent>{industries.map((industry) => (<SelectItem key={industry} value={industry}>{industry}</SelectItem>))}</SelectContent>
                    </Select>
                    {errors.industry && <p className="text-sm text-red-600">{errors.industry}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input id="city" placeholder="Enter city" value={organizationData.city} onChange={(e) => { setOrganizationData((prev) => ({ ...prev, city: e.target.value })); clearError("city"); }} />
                        {errors.city && <p className="text-sm text-red-600">{errors.city}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country">Country *</Label>
                        <Select value={organizationData.country} onValueChange={(value) => { setOrganizationData((prev) => ({ ...prev, country: value })); clearError("country"); }} >
                        <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                        <SelectContent>{countries.map((country) => (<SelectItem key={country} value={country}>{country}</SelectItem>))}</SelectContent>
                        </Select>
                        {errors.country && <p className="text-sm text-red-600">{errors.country}</p>}
                    </div>
                    </div>
                </div>
            </div>
        )}
        {step === 3 && (
            // Step 3 content remains the same
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Your Account Details</h2>
                    <p className="text-muted-foreground mt-2">Create your personal account</p>
                </div>
                <div className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input id="fullName" placeholder="Enter your full name" value={userData.fullName} onChange={(e) => { setUserData((prev) => ({ ...prev, fullName: e.target.value })); clearError("fullName"); }} />
                    {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" type="email" placeholder="your.email@example.com" value={userData.email} onChange={(e) => { setUserData((prev) => ({ ...prev, email: e.target.value })); clearError("email"); }} />
                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input id="password" type="password" placeholder="Create a password" value={userData.password} onChange={(e) => { setUserData((prev) => ({ ...prev, password: e.target.value })); clearError("password"); }} />
                    {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input id="confirmPassword" type="password" placeholder="Confirm your password" value={userData.confirmPassword} onChange={(e) => { setUserData((prev) => ({ ...prev, confirmPassword: e.target.value })); clearError("confirmPassword"); }} />
                    {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
                    </div>
                </div>
            </div>
        )}
        {step === 4 && (
            // Step 4 content remains the same
            <div className="space-y-6 text-center">
                <div className="space-y-4">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-green-600">Organization Created!</h2>
                    <p className="text-muted-foreground">
                    Your organization has been successfully created. Please check your email to verify your account.
                    </p>
                </div>
                <div className="bg-muted p-6 rounded-lg">
                    <h3 className="font-semibold mb-2">Your Organization Code</h3>
                    <div className="text-3xl font-mono font-bold text-primary mb-2">{generatedCode}</div>
                    <p className="text-sm text-muted-foreground">
                    Share this code with team members so they can join your organization during signup.
                    </p>
                </div>
                <Button onClick={() => router.push("/auth/login")} className="w-full">
                    Continue to Login
                </Button>
            </div>
        )}

        {step < 4 && (
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handleBack} disabled={step === 1 || loading}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleNext} disabled={loading || !isSupabaseConfigured}>
              {loading ? "Processing..." : step === 3 ? "Create Account" : "Next"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
