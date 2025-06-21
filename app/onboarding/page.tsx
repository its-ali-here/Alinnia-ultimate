"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"


export default function OnboardingPage() {
    const { user, organizationId, loading: authLoading, refreshOrganization } = useAuth()
    const router = useRouter()
    const [designation, setDesignation] = useState("")
    const [orgCode, setOrgCode] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // This effect handles redirection based on the user's auth state.
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                // If for some reason the user is not logged in, send them back to login.
                router.push("/auth/login?message=Please log in to continue.")
            } else if (organizationId) {
                // If the user is successfully associated with an org, send to the dashboard.
                router.push("/dashboard")
            }
        }
    }, [user, organizationId, authLoading, router])

    // This function is called when the user submits the form.
    const handleCompleteSetup = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!user) {
            toast.error("User not found. Please try logging in again.")
            return
        }

        if (!designation.trim() || !orgCode.trim()) {
            setError("Both designation and organization code are required.")
            return
        }

        setLoading(true)
        
        try {
            // We call our new API route to handle the backend logic.
            const response = await fetch('/api/complete-onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, orgCode, designation }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "An unknown error occurred.");
            }

            toast.success("Welcome aboard! Taking you to your dashboard...")
            // After successfully joining, we refresh the auth context.
            // This will update the organizationId, and the useEffect above will trigger the redirect.
            await refreshOrganization()
            
        } catch (err) {
            const errorMessage = (err as Error).message
            setError(errorMessage)
            toast.error(`Setup failed: ${errorMessage}`)
        } finally {
            setLoading(false)
        }
    }

    // While we wait for the initial auth check, we show a loading spinner.
    // We also show this if the user already has an org, just before they are redirected.
    if (authLoading || (user && organizationId)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Almost there!</CardTitle>
                    <CardDescription>
                        Just a few more details to get you set up. Please enter your designation and the code for the
                        organization you wish to join.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    <form onSubmit={handleCompleteSetup} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="designation">Your Designation</Label>
                            <Input
                                id="designation"
                                type="text"
                                placeholder="e.g., Software Engineer, Manager"
                                value={designation}
                                onChange={(e) => setDesignation(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="orgCode">Organization Code</Label>
                            <Input
                                id="orgCode"
                                type="text"
                                placeholder="Enter the 6-character code"
                                value={orgCode}
                                onChange={(e) => setOrgCode(e.target.value.toUpperCase())}
                                required
                                maxLength={6}
                                disabled={loading}
                            />
                             <p className="text-xs text-muted-foreground">
                                This code is provided by your organization's administrator.
                            </p>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Completing Setup...
                                </>
                            ) : (
                                "Complete Setup & Enter Dashboard"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}