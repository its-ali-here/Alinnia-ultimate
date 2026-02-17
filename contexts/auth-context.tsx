"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AuthContextType {
  user: User | null
  loading: boolean
  isSupabaseConfigured: boolean
  signOut: () => Promise<void>
  signUp: (data: any) => Promise<{ user: User | null; error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isIdle, setIsIdle] = useState(false)

  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null)
  const IDLE_TIMEOUT_DURATION = 30 * 60 * 1000 // 30 minutes

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      toast.error("An unexpected error occurred during sign out.")
      console.error("Unexpected error during signOut process:", err)
    } finally {
      setUser(null)
      router.push("/auth/login")
    }
  }, [router])

  const logoutDueToInactivity = useCallback(() => {
    toast.info("You have been logged out due to inactivity.")
    signOut()
    setIsIdle(true)
  }, [signOut])

  const resetIdleTimer = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current)
    }
    timeoutId.current = setTimeout(logoutDueToInactivity, IDLE_TIMEOUT_DURATION)
  }, [logoutDueToInactivity])

  useEffect(() => {
    if (!user) return
    const activityEvents: (keyof WindowEventMap)[] = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"]
    activityEvents.forEach((event) => window.addEventListener(event, resetIdleTimer))
    resetIdleTimer()
    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current)
      activityEvents.forEach((event) => window.removeEventListener(event, resetIdleTimer))
    }
  }, [user, resetIdleTimer])

  useEffect(() => {
    setLoading(true)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (formData: any): Promise<{ user: User | null; error: Error | null }> => {
    if (!isSupabaseConfigured()) {
      return { user: null, error: new Error("Supabase is not configured.") }
    }
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "An unknown error occurred during signup.")
      return { user: null, error: null }
    } catch (err) {
      return { user: null, error: err as Error }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isSupabaseConfigured: isSupabaseConfigured(),
        signOut,
        signUp,
      }}
    >
      {children}

      <AlertDialog open={isIdle}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Session Expired</AlertDialogTitle>
            <AlertDialogDescription>
              You have been logged out due to inactivity. Please log in again to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => router.push("/auth/login")}>Go to Login</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}