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
import { ArrowLeft, Building2, Users, AlertCircle, Loader2 } from "lucide-react" // Added Loader2
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
  const { isSupabaseConfigured } = useAuth() // This is a function from context
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
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (!organizationType) newErrors.organizationType = "Please select an option"
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
      else if (!/\S+@\S+\.\S+/.test(organizationData.email)) newErrors.orgEmail = "Invalid email format"
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
    else if (!/\S+@\S+\.\S+/.test(userData.email)) newErrors.email = "Invalid email format"
    if (userData.password.length < 6) newErrors.password = "Password must be at least 6 characters"
    if (userData.password !== userData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    clearError("general") // Clear general errors on step change
    if (step === 1 && validateStep1()) {
      if (organizationType === "existing") {
        setLoading(true)
        try {
          const org = await getOrganizationByCode(organizationCode)
          if (!org) {
            setErrors({ organizationCode: "Invalid organization code or organization not found." })
            return // setLoading(false) will be handled by finally
          }
          setStep(3)
        } catch (error) {
          console.error("Error validating organization code in handleNext:", error)
          setErrors({ organizationCode: `Error validating code: ${(error as Error).message}` })
        } finally {
          setLoading(false)
        }
      } else {
        setStep(2)
      }
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    } else if (step === 3 && validateStep3()) {
      await handleSignup() // setLoading is handled within handleSignup
    }
  }

  const handleBack = () => {
    clearError("general")
    setStep((prev) => (prev === 3 && organizationType === "existing" ? 1 : prev - 1))
  }

  const handleSignup = async () => {
    if (!isSupabaseConfigured) {
      // isSupabaseConfigured is from useAuth context
      setErrors({ general: "Authentication is not configured. Please check environment variables." })
      console.error("Signup attempt failed: Supabase client (from context) is not configured.")
      return
    }

    if (!supabase) {
      // Check the imported supabase client instance
      setErrors({ general: "Database client is not initialized. Check Supabase configuration." })
      console.error("Signup attempt failed: Imported Supabase client is null.")
      setLoading(false)
      return
    }

    setLoading(true)
    setErrors({}) // Clear previous errors
    console.log("Attempting Supabase user signup with email:", userData.email)

    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: { data: { full_name: userData.fullName } },
      })

      if (signUpError) {
        console.error("Supabase auth.signUp error:", JSON.stringify(signUpError, null, 2))
        setErrors({ general: `Auth error: ${signUpError.message} (Code: ${signUpError.code || "N/A"})` })
        // setLoading(false) handled in finally
        return
      }

      if (!signUpData.user) {
        console.error("Supabase auth.signUp did not return a user, but no error was thrown.")
        setErrors({ general: "User creation failed (no user data). Please try again." })
        // setLoading(false) handled in finally
        return
      }

      console.log("Supabase user created successfully. User ID:", signUpData.user.id)
      console.log("Calling /api/signup to create profile and organization...")

      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: signUpData.user.id,
          fullName: userData.fullName,
          email: userData.email,
          organizationType,
          organizationCode: organizationType === "existing" ? organizationCode : undefined,
          organizationData: organizationType === "new" ? organizationData : undefined,
        }),
      })

      const resultText = await response.text() // Get text first to avoid JSON parse error on non-JSON response
      let result
      try {
        result = JSON.parse(resultText)
      } catch (e) {
        console.error("/api/signup non-JSON response:", resultText)
        setErrors({ general: `API Error: Unexpected response from server. (Status: ${response.status})` })
        // setLoading(false) handled in finally
        return
      }

      if (!response.ok) {
        console.error("/api/signup error response:", JSON.stringify(result, null, 2))
        const apiErrorMessage = result.error || result.message || "An unexpected error occurred after signup."
        setErrors({ general: `API Error: ${apiErrorMessage} (Status: ${response.status})` })
        // setLoading(false) handled in finally
        return
      }

      console.log("/api/signup successful:", JSON.stringify(result, null, 2))

      if (organizationType === "new" && result.organizationCode) {
        setGeneratedCode(result.organizationCode)
        setStep(4)
      } else {
        router.push("/auth/login?message=Account created! Please check your email to verify your account.")
      }
    } catch (error) {
      // Catch any other unexpected errors during the process
      console.error("Unexpected error during handleSignup:", error)
      setErrors({ general: `An unexpected error occurred: ${(error as Error).message}` })
    } finally {
      setLoading(false)
    }
  }

  const getProgress = () => {
    if (organizationType === "existing") return step === 1 ? 33 : step === 3 ? 66 : 100
    return (step / 4) * 100
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <Progress value={getProgress()} className="w-full mb-4" />
      </CardHeader>
      <CardContent>
        {errors.general && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.general}</AlertDescription>
          </Alert>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Welcome to Alinnia</h2>
              <p className="text-muted-foreground mt-2">Let's get you set up with your organization</p>
            </div>
            <div className="space-y-4">
              <Label>Choose an option:</Label>
              <RadioGroup
                value={organizationType}
                onValueChange={(value) => {
                  setOrganizationType(value as "new" | "existing")
                  clearError("organizationType")
                  clearError("organizationCode")
                }}
              >
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent has-[input:checked]:border-primary has-[input:checked]:ring-1 has-[input:checked]:ring-primary">
                  <RadioGroupItem value="new" id="new" />
                  <Label htmlFor="new" className="flex items-center cursor-pointer flex-1">
                    <Building2 className="mr-3 h-5 w-5" />
                    <div>
                      <div className="font-medium">Create a new organization</div>
                      <div className="text-sm text-muted-foreground">Start fresh with your own organization</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent has-[input:checked]:border-primary has-[input:checked]:ring-1 has-[input:checked]:ring-primary">
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
              {errors.organizationType && <p className="text-sm text-destructive mt-1">{errors.organizationType}</p>}
            </div>
            {organizationType === "existing" && (
              <div className="space-y-2">
                <Label htmlFor="orgCode">Organization Code</Label>
                <Input
                  id="orgCode"
                  placeholder="Enter 6-character code"
                  value={organizationCode}
                  onChange={(e) => {
                    setOrganizationCode(e.target.value.toUpperCase())
                    clearError("organizationCode")
                  }}
                  maxLength={6}
                  className={errors.organizationCode ? "border-destructive" : ""}
                />
                {errors.organizationCode && <p className="text-sm text-destructive mt-1">{errors.organizationCode}</p>}
              </div>
            )}
          </div>
        )}
        {step === 2 && organizationType === "new" && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Organization Details</h2>
              <p className="text-muted-foreground mt-2">Tell us about your new organization</p>
            </div>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="orgName">Organization Name *</Label>
                <Input
                  id="orgName"
                  value={organizationData.name}
                  onChange={(e) => {
                    setOrganizationData((p) => ({ ...p, name: e.target.value }))
                    clearError("orgName")
                  }}
                  className={errors.orgName ? "border-destructive" : ""}
                />
                {errors.orgName && <p className="text-sm text-destructive mt-1">{errors.orgName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgEmail">Organization Email *</Label>
                <Input
                  id="orgEmail"
                  type="email"
                  value={organizationData.email}
                  onChange={(e) => {
                    setOrganizationData((p) => ({ ...p, email: e.target.value }))
                    clearError("orgEmail")
                  }}
                  className={errors.orgEmail ? "border-destructive" : ""}
                />
                {errors.orgEmail && <p className="text-sm text-destructive mt-1">{errors.orgEmail}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgPhone">Phone Number (Optional)</Label>
                <Input
                  id="orgPhone"
                  type="tel"
                  value={organizationData.phone}
                  onChange={(e) => setOrganizationData((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select
                  value={organizationData.industry}
                  onValueChange={(v) => {
                    setOrganizationData((p) => ({ ...p, industry: v }))
                    clearError("industry")
                  }}
                >
                  <SelectTrigger className={errors.industry ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((i) => (
                      <SelectItem key={i} value={i}>
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.industry && <p className="text-sm text-destructive mt-1">{errors.industry}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={organizationData.city}
                    onChange={(e) => {
                      setOrganizationData((p) => ({ ...p, city: e.target.value }))
                      clearError("city")
                    }}
                    className={errors.city ? "border-destructive" : ""}
                  />
                  {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select
                    value={organizationData.country}
                    onValueChange={(v) => {
                      setOrganizationData((p) => ({ ...p, country: v }))
                      clearError("country")
                    }}
                  >
                    <SelectTrigger className={errors.country ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.country && <p className="text-sm text-destructive mt-1">{errors.country}</p>}
                </div>
              </div>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Your Account Details</h2>
              <p className="text-muted-foreground mt-2">Create your personal account</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={userData.fullName}
                  onChange={(e) => {
                    setUserData((p) => ({ ...p, fullName: e.target.value }))
                    clearError("fullName")
                  }}
                  className={errors.fullName ? "border-destructive" : ""}
                />
                {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => {
                    setUserData((p) => ({ ...p, email: e.target.value }))
                    clearError("email")
                  }}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password * (min. 6 characters)</Label>
                <Input
                  id="password"
                  type="password"
                  value={userData.password}
                  onChange={(e) => {
                    setUserData((p) => ({ ...p, password: e.target.value }))
                    clearError("password")
                  }}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={userData.confirmPassword}
                  onChange={(e) => {
                    setUserData((p) => ({ ...p, confirmPassword: e.target.value }))
                    clearError("confirmPassword")
                  }}
                  className={errors.confirmPassword ? "border-destructive" : ""}
                />
                {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>
        )}
        {step === 4 && (
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
            {generatedCode && (
              <div className="bg-muted p-6 rounded-lg">
                <h3 className="font-semibold mb-2">Your Organization Code</h3>
                <div className="text-3xl font-mono font-bold text-primary mb-2">{generatedCode}</div>
                <p className="text-sm text-muted-foreground">
                  Share this code with team members so they can join your organization.
                </p>
              </div>
            )}
            <Button onClick={() => router.push("/auth/login")} className="w-full">
              Continue to Login
            </Button>
          </div>
        )}

        {step < 4 && (
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleBack} disabled={step === 1 || loading}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button onClick={handleNext} disabled={loading || !isSupabaseConfigured()}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Processing..." : step === 3 ? "Create Account" : "Next"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
