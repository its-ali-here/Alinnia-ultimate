"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, CheckCircle2, Mail } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import HCaptcha from "@hcaptcha/react-hcaptcha"

interface SignupFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SignupForm({ className, ...props }: SignupFormProps) {
  const router = useRouter()
  const { isSupabaseConfigured } = useAuth()
  
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    fullName: "", 
    email: "", 
    password: "", 
    confirmPassword: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Full name is required.")
      return false
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError("A valid email is required.")
      return false
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!validateForm()) return
    if (!isSupabaseConfigured) {
      setError("Authentication is not available.")
      return
    }

    if (!captchaToken) {
      setError("Please complete the captcha verification.")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/simple-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          captchaToken: captchaToken,
        }),
      })
      
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || "An unknown error occurred during signup.")
      }
      
      setSignupSuccess(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  if (signupSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Account Created Successfully!</CardTitle>
          <CardDescription>
            Your account has been created and is ready to use.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-green-50 p-4">
            <div className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
              <div className="text-sm text-green-800">
                <p className="font-medium mb-1">You're all set!</p>
                <p>You can now log in to your account and start using Alinnia.</p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => router.push('/auth/login')}
            className="w-full"
          >
            Go to Login
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Enter your details to get started with Alinnia
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
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          <div className="flex justify-center py-2">
            <HCaptcha
              sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITEKEY || "76106d52-1748-40da-8540-1e600504f790"}
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
              onError={() => setCaptchaToken(null)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
