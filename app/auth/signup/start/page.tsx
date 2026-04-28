"use client"

import { useOnboarding } from "@/contexts/onboarding-context"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import Link from "next/link"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
})

type FormData = z.infer<typeof formSchema>

export default function OnboardingStartPage() {
  const { nextStep, updateData, data } = useOnboarding()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: data.email || "",
      password: data.password || "",
      firstName: data.firstName || "",
      lastName: data.lastName || "",
    },
  })
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (formData: FormData) => {
    setError(null)
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const detail = errorData.error ? `: ${errorData.error}` : ''
        throw new Error((errorData.message || 'Something went wrong') + detail)
      }

      const supabase = createSupabaseBrowserClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })
      if (signInError) throw new Error("Account created but sign-in failed: " + signInError.message)

      updateData(formData)
      nextStep()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="w-full max-w-[420px] px-4 py-6">
      {/* Card */}
      <div className="bg-card rounded-[18px] shadow-[0_8px_40px_rgba(28,25,23,0.10),0_2px_8px_rgba(28,25,23,0.05)] overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-6 text-center border-b border-border">
          <Link href="/" className="inline-block font-serif text-[22px] font-semibold text-foreground mb-6">
            Alinnia
          </Link>
          <h1 className="font-serif text-[26px] font-semibold text-foreground leading-tight mb-2">
            Let's get you started
          </h1>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            Create your account, then we'll set up your first project.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-8 py-6 space-y-4">
            {error && (
              <Alert variant="destructive" className="rounded-[10px]">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-[12px]">{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">
                  First name
                </label>
                <Input
                  id="firstName"
                  placeholder="Jane"
                  {...register("firstName")}
                  disabled={isSubmitting}
                  className="bg-muted border-border focus:border-primary text-[13px]"
                />
                {errors.firstName && (
                  <p className="text-[11px] text-destructive mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">
                  Last name
                </label>
                <Input
                  id="lastName"
                  placeholder="Smith"
                  {...register("lastName")}
                  disabled={isSubmitting}
                  className="bg-muted border-border focus:border-primary text-[13px]"
                />
                {errors.lastName && (
                  <p className="text-[11px] text-destructive mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="jane@example.com"
                {...register("email")}
                disabled={isSubmitting}
                className="bg-muted border-border focus:border-primary text-[13px]"
              />
              {errors.email && (
                <p className="text-[11px] text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="At least 6 characters"
                {...register("password")}
                disabled={isSubmitting}
                className="bg-muted border-border focus:border-primary text-[13px]"
              />
              {errors.password && (
                <p className="text-[11px] text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div className="px-8 pb-8">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-[10px] h-10 text-[13px] font-semibold shadow-[0_2px_8px_hsl(var(--primary)/0.3)]"
            >
              {isSubmitting ? 'Creating account…' : 'Continue →'}
            </Button>
            <p className="text-center text-[12px] text-muted-foreground mt-4">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
