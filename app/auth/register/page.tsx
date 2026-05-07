"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { ArrowRight, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Suspense } from "react"

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session")
  const { user, loading: authLoading } = useAuth()
  const supabase = createSupabaseBrowserClient()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName]   = useState("")
  const [email, setEmail]         = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent]           = useState(false)
  const [error, setError]         = useState<string | null>(null)

  // Already logged in — just link and go
  useEffect(() => {
    if (!authLoading && user) {
      if (sessionId) localStorage.setItem("pendingSessionId", sessionId)
      router.replace("/control-centre")
    }
  }, [user, authLoading, sessionId, router])

  if (authLoading) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    setError(null)

    // Persist name so set-password page can update the profile
    localStorage.setItem("pendingName", JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim() }))
    if (sessionId) localStorage.setItem("pendingSessionId", sessionId)

    const redirectTo = `${window.location.origin}/auth/callback`

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectTo,
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        },
      },
    })

    if (otpError) {
      setError(otpError.message)
      setSubmitting(false)
      return
    }

    setSent(true)
    setSubmitting(false)
  }

  if (sent) {
    return (
      <div className="w-full max-w-[420px] px-4">
        <div className="bg-card border border-border rounded-[18px] p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[hsl(var(--brand-soft))] flex items-center justify-center mx-auto">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-serif text-[22px] font-semibold text-foreground">Check your inbox</h1>
          <p className="text-[13px] text-muted-foreground leading-relaxed">
            We've sent a link to <span className="font-medium text-foreground">{email}</span>.
            Click it to set your password and access your guide.
          </p>
          <p className="text-[11px] text-muted-foreground">
            No email?{" "}
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-primary underline"
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[420px] px-4">
      <div className="bg-card border border-border rounded-[18px] shadow-sm overflow-hidden">
        <div className="px-8 pt-8 pb-2 text-center">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-2">
            Almost there
          </p>
          <h1 className="font-serif text-[26px] font-semibold text-foreground leading-tight mb-2">
            Create your account
          </h1>
          <p className="text-[13px] text-muted-foreground">
            We'll email you a link — click it to set your password and open your dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">
                First name
              </label>
              <input
                type="text"
                required
                placeholder="Sarah"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-[10px] border border-border bg-muted text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">
                Last name
              </label>
              <input
                type="text"
                placeholder="Johnson"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full h-10 px-3.5 rounded-[10px] border border-border bg-muted text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">
              Email address
            </label>
            <input
              type="email"
              required
              placeholder="sarah@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-10 px-3.5 rounded-[10px] border border-border bg-muted text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>

          {error && (
            <p className="text-[12px] text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !email.trim() || !firstName.trim()}
            className={cn(
              "w-full flex items-center justify-center gap-2 h-11 rounded-[10px] text-[14px] font-semibold transition-all",
              !submitting && email.trim() && firstName.trim()
                ? "bg-primary text-primary-foreground shadow-[0_2px_12px_hsl(var(--primary)/0.3)] hover:opacity-90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {submitting ? "Sending…" : (
              <>Send my link <ArrowRight className="w-4 h-4" /></>
            )}
          </button>

          <p className="text-center text-[11px] text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
