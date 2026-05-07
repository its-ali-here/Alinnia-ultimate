"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { Eye, EyeOff, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SetPasswordPage() {
  const router   = useRouter()
  const { user, loading: authLoading } = useAuth()
  const supabase = createSupabaseBrowserClient()

  const [password, setPassword]   = useState("")
  const [confirm, setConfirm]     = useState("")
  const [showPw, setShowPw]       = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  // Not authenticated — the magic link didn't work or was skipped
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signup")
    }
  }, [user, authLoading, router])

  if (authLoading || !user) return null

  // Pull name from localStorage (stored before sending magic link)
  const storedName = (() => {
    try {
      return JSON.parse(localStorage.getItem("pendingName") ?? "{}")
    } catch {
      return {}
    }
  })()

  const firstName: string = storedName.firstName ?? ""
  const lastName:  string = storedName.lastName  ?? ""

  const valid = password.length >= 8 && password === confirm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    setSubmitting(true)
    setError(null)

    // 1. Set the password
    const { error: pwError } = await supabase.auth.updateUser({ password })
    if (pwError) {
      setError(pwError.message)
      setSubmitting(false)
      return
    }

    // 2. Update the profile with name
    if (firstName || lastName) {
      await supabase
        .from("profiles")
        .upsert({ id: user.id, first_name: firstName || null, last_name: lastName || null, email: user.email })
    }

    // 3. Clean up localStorage
    localStorage.removeItem("pendingName")

    // 4. Go to dashboard — project-context will auto-link pending session
    router.push("/control-centre")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        <div className="bg-card border border-border rounded-[18px] shadow-sm overflow-hidden">
          <div className="px-8 pt-8 pb-2 text-center">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-2">
              One last step
            </p>
            <h1 className="font-serif text-[26px] font-semibold text-foreground leading-tight mb-2">
              {firstName ? `Welcome, ${firstName}` : "Choose a password"}
            </h1>
            <p className="text-[13px] text-muted-foreground">
              Set a password so you can sign back in any time.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full h-10 px-3.5 pr-10 rounded-[10px] border border-border bg-muted text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">
                Confirm password
              </label>
              <input
                type={showPw ? "text" : "password"}
                required
                placeholder="Same again"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className={cn(
                  "w-full h-10 px-3.5 rounded-[10px] border bg-muted text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all",
                  confirm && !valid
                    ? "border-destructive focus:border-destructive"
                    : "border-border focus:border-primary"
                )}
              />
              {confirm && password !== confirm && (
                <p className="text-[11px] text-destructive mt-1">Passwords don't match</p>
              )}
            </div>

            {error && <p className="text-[12px] text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={!valid || submitting}
              className={cn(
                "w-full flex items-center justify-center gap-2 h-11 rounded-[10px] text-[14px] font-semibold transition-all",
                valid && !submitting
                  ? "bg-primary text-primary-foreground shadow-[0_2px_12px_hsl(var(--primary)/0.3)] hover:opacity-90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {submitting ? "Setting up…" : (
                <>Go to my dashboard <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
