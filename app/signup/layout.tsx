"use client"

import { OnboardingProvider } from "@/contexts/onboarding-context"

export default function SignupLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <OnboardingProvider>
            <div className="h-screen bg-gray-50 flex flex-col items-center justify-center">
                {children}
            </div>
        </OnboardingProvider>
    )
}
