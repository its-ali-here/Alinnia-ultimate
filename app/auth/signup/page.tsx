import { SignupForm } from "@/components/auth/signup-form"
import Link from "next/link"
import { Suspense } from "react"

function SignupFormWrapper() {
  return <SignupForm />
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold">
            Alinnia
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">Create your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Or{" "}
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="h-10 bg-muted animate-pulse rounded-md" />
              <div className="h-10 bg-muted animate-pulse rounded-md" />
              <div className="h-10 bg-muted animate-pulse rounded-md" />
              <div className="h-10 bg-muted animate-pulse rounded-md" />
            </div>
          }
        >
          <SignupFormWrapper />
        </Suspense>
      </div>
    </div>
  )
}
