"use client"

import { SignupForm } from "@/components/auth/signup-form"
import Link from "next/link"
import { Suspense, useState } from "react"
import HCaptcha from "@hcaptcha/react-hcaptcha"

function SignupFormWrapper({ captchaToken }: { captchaToken: string | null }) {
  // @ts-ignore - Ensure SignupForm is updated to accept this prop
  return <SignupForm captchaToken={captchaToken} />
}

export default function SignupPage() {
  const [captchaToken, setToken] = useState<string | null>(null);

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
          <SignupFormWrapper captchaToken={captchaToken} />
        </Suspense>

        <div className="flex justify-center mt-4">
            <HCaptcha
            sitekey="76106d52-1748-40da-8540-1e600504f790"
            onVerify={(newToken) => setToken(newToken)}
            onExpire={() => setToken(null)} // resets token if it expires
            onError={() => setToken(null)}  // avoids errors on failure
          />
        </div>
      </div>
    </div>
  )
}
