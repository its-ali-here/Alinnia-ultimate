"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  // We don't need organizationId for the strict check anymore
  const { user, loading } = useAuth() 
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Only redirect if they are strictly NOT logged in
        router.push("/login")
      } 
      // DELETED: else if (!organizationId) { router.push("/signup") }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <div className="w-72 border-r bg-background p-4 space-y-4">
          <Skeleton className="h-8 w-32" />
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
        <div className="flex-1">
          <div className="border-b p-4">
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="p-6 space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Allow rendering if user exists, even if orgId is still loading/null
  if (!user) {
    return null
  }

  return <>{children}</>
}