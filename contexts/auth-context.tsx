"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { getUserOrganizations } from "@/lib/database"

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
    orgId?: string
  }) => Promise<{ user: User | null; error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchAndSetOrganization = useCallback(async (currentUser: User) => {
    console.log("AuthContext: Fetching organizations for user", currentUser.id)
    try {
      const orgs = await getUserOrganizations(currentUser.id)
      if (orgs && orgs.length > 0) {
        const firstOrgId = orgs[0].id
        setOrganizationId(firstOrgId)
        console.log("AuthContext: Set active organizationId to", firstOrgId)
      } else {
        setOrganizationId(null)
        console.warn("AuthContext: User is not a member of any organization.")
      }
    } catch (error) {
      console.error("AuthContext: Error fetching user organizations:", error)
      setOrganizationId(null)
    }
  }, [])

  const refreshOrganization = useCallback(async () => {
    if (user) {
      await fetchAndSetOrganization(user)
    }
  }, [user, fetchAndSetOrganization])

  useEffect(() => {
    setLoading(true)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AuthContext: Auth state changed. Event:", event)
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        await fetchAndSetOrganization(currentUser)
      } else {
        // User logged out, clear organization
        setOrganizationId(null)
        console.log("AuthContext: User logged out, cleared organizationId.")
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchAndSetOrganization])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setOrganizationId(null) // Explicitly clear on sign out
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Comprehensive signUp function that calls your custom API route
  const signUp = useCallback(
    async ({ email, password, fullName, orgType, orgName, orgId }) => {
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
            orgId,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          return { user: null, error: new Error(result.error || "An unknown error occurred during signup.") }
        }

        // After successful signup via API, explicitly set the organizationId
        if (result.organizationId) {
          setOrganizationId(result.organizationId)
          // Also trigger a session refresh to ensure the client-side user object is up-to-date
          // and the auth state listener picks up the latest profile data.
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

        return { user: signedUpUser, error: null }
      } catch (err) {
        console.error("AuthContext: signUp error:", err)
        return { user: null, error: err as Error }
      }
    },
    [isSupabaseConfigured, refreshOrganization],
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
