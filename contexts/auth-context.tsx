"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react"
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
  signUp: (data: any) => Promise<{ user: User | null; error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [organizationId, setOrganizationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const timeoutId = useRef<NodeJS.Timeout>();
  const IDLE_TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes

  const logoutDueToInactivity = useCallback(() => {
    // We use the signOut function you already created!
    signOut();
    // You can use a more elegant notification here if you like
    alert("You have been logged out due to inactivity.");
  }, [signOut]);

  const resetIdleTimer = useCallback(() => {
    // Clear any existing timer
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    // Set a new timer
    timeoutId.current = setTimeout(logoutDueToInactivity, IDLE_TIMEOUT_DURATION);
  }, [logoutDueToInactivity]);

  useEffect(() => {
    // Don't run the timer if no user is logged in
    if (!user) {
      return;
    }

    // List of events that indicate user activity
    const activityEvents: (keyof WindowEventMap)[] = [
      'mousemove',
      'keydown',
      'mousedown',
      'touchstart',
      'scroll',
    ];

    // Add event listeners to reset the timer on any activity
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetIdleTimer);
    });

    // Start the timer when the component mounts (or when the user logs in)
    resetIdleTimer();

    // Cleanup function to remove listeners when the component unmounts
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer);
      });
    };
  }, [user, resetIdleTimer]); // Rerun this effect if the user logs in or out

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
    // This function runs once on initial load to get the session
    // and stop the main loading screen.
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchAndSetOrganization(currentUser);
      }
      setLoading(false); // End the initial loading state
    };

    getInitialSession();

    // The listener now only updates the user session in the background
    // without triggering the main loading screen.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // If a user logs in, fetch their org info
          await fetchAndSetOrganization(currentUser);
        } else {
          // If a user logs out, clear the org info
          setOrganizationId(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchAndSetOrganization]);
  // --- END OF CORRECTED SECTION ---

  const signOut = async () => {
    try {
      // Let Supabase handle all session and storage clearing.
      const { error } = await supabase.auth.signOut();

      // If signOut itself has an error, log it and stop.
      if (error) {
        console.error("Error during Supabase signOut:", error);
        return;
      }

      // This forces a full page reload to the homepage, ensuring a clean state.
      window.location.replace("/");

    } catch (err) {
      console.error("Unexpected error during signOut process:", err);
    }
  };

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
          // If the API returns an error, pass it along
          throw new Error(result.error || "An unknown error occurred during signup.");
        }

        // On success, just return a success state with no user object
        return { user: null, error: null };
        
      } catch (err) {
        console.error("AuthContext: signUp error:", err);
        return { user: null, error: err as Error };
      }
    },
    [], // Dependencies removed as they are no longer needed here
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