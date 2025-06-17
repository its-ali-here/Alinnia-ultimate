import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { Suspense } from "react"

function LoginFormWrapper() {
  return <LoginForm />
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold">
            Alinnia
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight">Sign in to your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Or{" "}
            <Link href="/auth/signup" className="font-medium text-primary hover:underline">
              create a new account
            </Link>
          </p>
        </div>
        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="h-10 bg-muted animate-pulse rounded-md" />
              <div className="h-10 bg-muted animate-pulse rounded-md" />
              <div className="h-10 bg-muted animate-pulse rounded-md" />
            </div>
          }
        >
          <LoginFormWrapper />
        </Suspense>
      </div>
    </div>
  )
}
