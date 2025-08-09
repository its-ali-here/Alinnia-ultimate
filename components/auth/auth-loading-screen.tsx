"use client"

import { Loader2 } from "lucide-react"

interface AuthLoadingScreenProps {
  message?: string
}

export function AuthLoadingScreen({ message = "Loading..." }: AuthLoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <Loader2 className="w-8 h-8 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold text-foreground">Alinnia</h2>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  )
}

// Specific loading screens for different auth states
export function AuthCheckingScreen() {
  return <AuthLoadingScreen message="Checking authentication..." />
}

export function OrganizationCheckingScreen() {
  return <AuthLoadingScreen message="Checking organization membership..." />
}

export function RedirectingScreen() {
  return <AuthLoadingScreen message="Redirecting..." />
}
