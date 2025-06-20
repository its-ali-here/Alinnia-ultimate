"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { getUserOrganizationsServer } from "@/app/actions/organization" // Import the new Server Action

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
      // Call the Server Action to fetch organizations
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

  const signOut = async () => {
    try {
      await supabase.auth.signOut()

      // Explicitly clear local storage items related to Supabase sessions
      localStorage.removeItem("sb-oauth-token")
      localStorage.removeItem("sb-access-token")
      localStorage.removeItem("supabase.auth.token")
      localStorage.removeItem("sb-auth-token")

      // Also clear any application-specific user state if not handled by onAuthStateChange
      setUser(null)
      setOrganizationId(null)

      // Force a full page reload to ensure all client-side state is reset
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

        // After successful signup via API, explicitly set the organizationId
        if (result.organizationId) {
          setOrganizationId(result.organizationId)
          console.log("AuthContext: signUp - API returned organizationId:", result.organizationId)
          // Also trigger a session refresh to ensure the client-side user object is up-to-date
          await supabase.auth.refreshSession()
          await refreshOrganization() // Ensure context is fully updated
        }

        // The auth state change listener will pick up the user.
        const {
          data: { user: signedUpUser },
          error: sessionError,
        } = await supabase.auth.getSession()
        if (sessionError) {
          console.error("Error getting session after signup:", sessionError)
        }
        console.log(
          "AuthContext: signUp - Final signedUpUser:",
          signedUpUser?.id,
          "Current Org ID in state:",
          organizationId,
        )

        return { user: signedUpUser, error: null }
      } catch (err) {
        console.error("AuthContext: signUp error:", err)
        return { user: null, error: err as Error }
      }
    },
    [isSupabaseConfigured, refreshOrganization, organizationId], // Added organizationId to dependency array
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
        signUp, // Expose the new signUp function
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
