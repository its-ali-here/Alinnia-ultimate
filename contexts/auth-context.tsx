"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { getUserOrganizationsServer } from "@/app/actions/organization"

interface AuthContextType {
  user: User | null
  organizationId: string | null
  loading: boolean
  isSupabaseConfigured: boolean
  signOut: () => Promise<void>
  refreshOrganization: () => Promise<void>
  signUp: (data: {
    email: string
    password: string
    fullName: string
    orgType: "new" | "existing"
    orgName?: string
    orgCode?: string
  }) => Promise<{ user: User | null; error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAndSetOrganization = useCallback(async (currentUser: User) => {
    console.log("AuthContext: fetchAndSetOrganization - Starting for user", currentUser.id)
    try {
      const orgs = await getUserOrganizationsServer(currentUser.id)
      console.log("AuthContext: fetchAndSetOrganization - Received organizations:", orgs)
      if (orgs && orgs.length > 0) {
        const firstOrgId = orgs[0].id
        setOrganizationId(firstOrgId)
        console.log("AuthContext: fetchAndSetOrganization - Set active organizationId to", firstOrgId)
      } else {
        setOrganizationId(null)
        console.warn("AuthContext: fetchAndSetOrganization - User is not a member of any organization.")
      }
    } catch (error) {
      console.error("AuthContext: fetchAndSetOrganization - Error fetching user organizations:", error)
      setOrganizationId(null)
    } finally {
      console.log("AuthContext: fetchAndSetOrganization - Finished.")
    }
  }, [])

  const refreshOrganization = useCallback(async () => {
    console.log("AuthContext: refreshOrganization called.")
    if (user) {
      await fetchAndSetOrganization(user)
    } else {
      console.warn("AuthContext: refreshOrganization called but no user is logged in.")
    }
  }, [user, fetchAndSetOrganization])

  // --- THIS IS THE CORRECTED SECTION ---
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true)
      try {
        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await fetchAndSetOrganization(currentUser)
        } else {
          setOrganizationId(null)
        }
      } catch (e) {
        console.error("Error during auth state change:", e)
        setUser(null)
        setOrganizationId(null)
      } finally {
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchAndSetOrganization])
  // --- END OF CORRECTED SECTION ---


  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem("sb-oauth-token")
      localStorage.removeItem("sb-access-token")
      localStorage.removeItem("supabase.auth.token")
      localStorage.removeItem("sb-auth-token")
      setUser(null)
      setOrganizationId(null)
      window.location.replace("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const signUp = useCallback(
    async ({ email, password, fullName, orgType, orgName, orgCode }) => {
      if (!isSupabaseConfigured()) {
        return { user: null, error: new Error("Supabase is not configured.") }
      }

      try {
        const response = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password,
            fullName,
            orgType,
            orgName,
            orgCode,
          }),
        })

        const result = await response.json()
        console.log("AuthContext: signUp API response:", result)

        if (!response.ok) {
          return { user: null, error: new Error(result.error || "An unknown error occurred during signup.") }
        }

        if (result.organizationId) {
          setOrganizationId(result.organizationId)
          await supabase.auth.refreshSession()
          await refreshOrganization()
        }

        const {
          data: { user: signedUpUser },
        } = await supabase.auth.getSession()

        return { user: signedUpUser, error: null }
      } catch (err) {
        console.error("AuthContext: signUp error:", err)
        return { user: null, error: err as Error }
      }
    },
    [refreshOrganization],
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        organizationId,
        loading,
        isSupabaseConfigured: isSupabaseConfigured(),
        signOut,
        refreshOrganization,
        signUp,
      }}
    >
      {children}
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