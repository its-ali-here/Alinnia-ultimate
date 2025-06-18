"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { getUserOrganizations } from "@/lib/database" // We need this function

interface AuthContextType {
  user: User | null
  organizationId: string | null // <-- ADDED
  loading: boolean
  isSupabaseConfigured: boolean
  signOut: () => Promise<void>
  refreshOrganization: () => Promise<void> // <-- ADDED
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
        // For now, we'll use the first organization.
        // A multi-org setup would require a selector here.
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

  return (
    <AuthContext.Provider
      value={{
        user,
        organizationId, // <-- EXPOSED
        loading,
        isSupabaseConfigured: isSupabaseConfigured(),
        signOut,
        refreshOrganization, // <-- EXPOSED
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
