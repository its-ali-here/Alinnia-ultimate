"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { getUserOrganizationsServer } from "@/app/actions/organization"
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
  organizationId: string | null
  loading: boolean
  isSupabaseConfigured: boolean
  signOut: () => Promise<void>
  refreshOrganization: () => Promise<void>
  signUp: (data: any) => Promise<{ user: User | null; error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isIdle, setIsIdle] = useState(false);

  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const IDLE_TIMEOUT_DURATION = 10 * 1000; // 30 minutes

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error during Supabase signOut:", error);
        return;
      }
      window.location.replace("/");
    } catch (err) {
      console.error("Unexpected error during signOut process:", err);
    }
  }, []);

  const handleIdleLogout = useCallback(async () => {
    await signOut();
    window.location.replace("/auth/login");
  }, [signOut]);

  const logoutDueToInactivity = useCallback(() => {
    signOut(); // Sign out the session in the background
    setIsIdle(true); // Show the blocking modal
  }, [signOut]);

  const resetIdleTimer = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    timeoutId.current = setTimeout(logoutDueToInactivity, IDLE_TIMEOUT_DURATION);
  }, [logoutDueToInactivity]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const activityEvents: (keyof WindowEventMap)[] = [
      'mousemove',
      'keydown',
      'mousedown',
      'touchstart',
      'scroll',
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetIdleTimer);
    });

    resetIdleTimer();

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer);
      });
    };
  }, [user, resetIdleTimer]);

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

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchAndSetOrganization(currentUser);
      }
      setLoading(false); 
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchAndSetOrganization(currentUser);
        } else {
          setOrganizationId(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchAndSetOrganization]);

  const signUp = useCallback(
    async (formData: any) => {
      if (!isSupabaseConfigured()) {
        return { user: null, error: new Error("Supabase is not configured.") };
      }

      try {
        const response = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "An unknown error occurred during signup.");
        }

        return { user: null, error: null };
        
      } catch (err) {
        console.error("AuthContext: signUp error:", err);
        return { user: null, error: err as Error };
      }
    },
    [],
  );

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

      {/* Add this AlertDialog to show when the user is idle */}
      <AlertDialog open={isIdle}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Session Expired</AlertDialogTitle>
            <AlertDialogDescription>
              You have been logged out due to inactivity. Please log in again to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleIdleLogout}>
              Go to Login
            </AlertDialogAction>
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