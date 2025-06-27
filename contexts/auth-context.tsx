// contexts/auth-context.tsx

"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { getUserOrganizationData } from "@/app/actions/organization"

interface AuthContextType {
    user: User | null;
    organization: any | null;
    userRole: string | null;
    loading: boolean;
    isSupabaseConfigured: boolean;
    signOut: () => Promise<void>;
    refreshOrganization: () => Promise<void>;
    signUp: (data: any) => Promise<{ user: User | null; error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAndSetOrganization = useCallback(async (currentUser: User) => {
    console.log("[AUTH CONTEXT] fetchAndSetOrganization called.");
    try {
      const orgData = await getUserOrganizationData(currentUser.id);

      // --- ADDED LOGS ---
      console.log("[AUTH CONTEXT] Data received from server action:", orgData);
      // --- END OF LOGS ---

      if (orgData) {
        console.log("[AUTH CONTEXT] Setting organization state:", orgData.organization.name);
        setOrganization(orgData.organization);
        setUserRole(orgData.role);
      } else {
        console.log("[AUTH CONTEXT] No organization data received. Setting state to null.");
        setOrganization(null);
        setUserRole(null);
      }
    } catch (error) {
      console.error("AuthContext: Error fetching user organization data:", error);
      setOrganization(null);
      setUserRole(null);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("[AUTH CONTEXT] onAuthStateChange triggered. Event:", _event);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchAndSetOrganization(currentUser);
        } else {
          setOrganization(null);
          setUserRole(null);
        }

        setLoading(false);
      }
    );

    return () => { subscription.unsubscribe(); };
  }, [fetchAndSetOrganization]);

  const refreshOrganization = useCallback(async () => {
    if (user) await fetchAndSetOrganization(user);
  }, [user, fetchAndSetOrganization]);

  const signOut = async () => { /* ... */ };
  const signUp = async (formData: any) => { /* ... */ };

  return (
    <AuthContext.Provider value={{ user, organization, userRole, loading, isSupabaseConfigured: isSupabaseConfigured(), signOut, refreshOrganization, signUp }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}