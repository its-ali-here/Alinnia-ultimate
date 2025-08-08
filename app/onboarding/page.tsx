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
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Loader2, Upload, ChevronLeft, ChevronRight, Building2, Users, Target, FileText, Sparkles } from "lucide-react"
import { toast } from "sonner"

// Business setup data interface
interface BusinessSetupData {
    designation: string
    businessType: string
    businessDescription: string
    businessMetrics: Record<string, any>
    csvFile?: File
}

export default function OnboardingPage() {
    const { user, organizationId, loading: authLoading, refreshOrganization } = useAuth()
    const router = useRouter()
    
    // Multi-step form state
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    // Form data
    const [formData, setFormData] = useState<BusinessSetupData>({
        designation: "",
        businessType: "",
        businessDescription: "",
        businessMetrics: {}
    })

    // Business type configurations
    const businessTypes = {
        restaurant: {
            name: "Restaurant / Food Service",
            description: "Restaurants, cafes, bars, food trucks, catering",
            metrics: [
                { key: "table_count", label: "Number of Tables", type: "number", placeholder: "e.g., 20" },
                { key: "seat_count", label: "Total Seating Capacity", type: "number", placeholder: "e.g., 80" },
                { key: "cuisine_type", label: "Cuisine Type", type: "text", placeholder: "e.g., Italian, Fast Food" },
                { key: "avg_service_time", label: "Average Service Time (minutes)", type: "number", placeholder: "e.g., 90" },
                { key: "operating_hours", label: "Daily Operating Hours", type: "number", placeholder: "e.g., 12" },
                { key: "staff_count", label: "Number of Staff", type: "number", placeholder: "e.g., 15" }
            ]
        },
        auto_shop: {
            name: "Auto Repair / Service",
            description: "Auto repair shops, tire shops, oil change services",
            metrics: [
                { key: "bay_count", label: "Number of Service Bays", type: "number", placeholder: "e.g., 6" },
                { key: "mechanic_count", label: "Number of Mechanics", type: "number", placeholder: "e.g., 4" },
                { key: "avg_repair_time", label: "Average Repair Time (hours)", type: "number", placeholder: "e.g., 3" },
                { key: "operating_hours", label: "Daily Operating Hours", type: "number", placeholder: "e.g., 10" },
                { key: "specialties", label: "Service Specialties", type: "text", placeholder: "e.g., Brakes, Engine, Transmission" }
            ]
        },
        retail: {
            name: "Retail / E-commerce",
            description: "Physical stores, online shops, marketplaces",
            metrics: [
                { key: "store_count", label: "Number of Locations", type: "number", placeholder: "e.g., 3" },
                { key: "product_categories", label: "Main Product Categories", type: "text", placeholder: "e.g., Electronics, Clothing" },
                { key: "avg_transaction", label: "Average Transaction Value", type: "number", placeholder: "e.g., 75" },
                { key: "inventory_items", label: "Number of SKUs", type: "number", placeholder: "e.g., 500" },
                { key: "staff_count", label: "Number of Staff", type: "number", placeholder: "e.g., 8" }
            ]
        }
    }

    const totalSteps = 5
    const progress = (currentStep / totalSteps) * 100

    // Step navigation
    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    // Form handlers
    const updateFormData = (field: keyof BusinessSetupData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const updateBusinessMetric = (key: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            businessMetrics: { ...prev.businessMetrics, [key]: value }
        }))
    }

    // This effect handles redirection based on the user's auth state.
    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push("/auth/login?message=Please log in to continue.")
            } else if (!organizationId) {
                router.push("/auth/organization-setup")
            } else {
                // Check if business onboarding is already completed
                checkBusinessOnboardingStatus()
            }
        }
    }, [user, organizationId, authLoading, router])

    const checkBusinessOnboardingStatus = async () => {
        if (!user) return

        try {
            const response = await fetch(`/api/business-profile?userId=${user.id}`)
            const result = await response.json()

            if (result.success && result.data && result.data.onboarding_completed) {
                // Business onboarding already completed, go to dashboard
                router.push("/dashboard")
            }
            // If not completed, stay on onboarding page
        } catch (error) {
            console.error("Error checking business onboarding status:", error)
            // Stay on onboarding page if there's an error
        }
    }

    // Handle CSV file upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.type === 'text/csv') {
            updateFormData('csvFile', file)
            toast.success("CSV file uploaded successfully!")
        } else {
            toast.error("Please upload a valid CSV file.")
        }
    }

    // Validate current step
    const validateStep = () => {
        switch (currentStep) {
            case 1:
                return formData.designation.trim()
            case 2:
                return formData.businessType
            case 3:
                return formData.businessDescription.trim()
            case 4:
                return Object.keys(formData.businessMetrics).length > 0
            case 5:
                return true // CSV upload is optional
            default:
                return false
        }
    }

    // This function is called when the user completes the entire setup.
    const handleCompleteSetup = async () => {
        setError(null)

        if (!user) {
            toast.error("User not found. Please try logging in again.")
            return
        }

        setLoading(true)
        
        try {
            // Save the business profile and designation
            const profileResponse = await fetch('/api/business-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    designation: formData.designation,
                    businessType: formData.businessType,
                    businessDescription: formData.businessDescription,
                    businessMetrics: formData.businessMetrics
                }),
            });

            if (!profileResponse.ok) {
                const result = await profileResponse.json();
                throw new Error(result.error || "Failed to save business profile.");
            }

            // Update user designation in organization_members table
            const designationResponse = await fetch('/api/update-designation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    designation: formData.designation
                }),
            });

            if (!designationResponse.ok) {
                console.warn("Failed to update designation, but continuing...");
            }

            toast.success("🎉 Setup complete! Generating your custom business blueprint...")
            
            // Refresh organization context and redirect
            await refreshOrganization()
            router.push("/dashboard")
            
        } catch (err) {
            const errorMessage = (err as Error).message
            setError(errorMessage)
            toast.error(`Setup failed: ${errorMessage}`)
        } finally {
            setLoading(false)
        }
    }

    // While we wait for the initial auth check, we show a loading spinner.
    if (authLoading || (user && !organizationId)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    // Step components
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1Designation />
            case 2:
                return <Step2BusinessType />
            case 3:
                return <Step3BusinessDescription />
            case 4:
                return <Step4BusinessMetrics />
            case 5:
                return <Step5DataUpload />
            default:
                return null
        }
    }

    // Step 1: Designation
    const Step1Designation = () => (
        <div className="space-y-6">
            <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-bold">Let's Set Up Your Business!</h2>
                <p className="text-muted-foreground">We'll create a custom analytics platform tailored to your business</p>
            </div>
            
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="designation">What's your role in this organization?</Label>
                    <Input
                        id="designation"
                        type="text"
                        placeholder="e.g., Owner, Manager, Analyst, Operations Manager"
                        value={formData.designation}
                        onChange={(e) => updateFormData('designation', e.target.value)}
                        required
                    />
                    <p className="text-xs text-muted-foreground">
                        This helps us customize the experience for your responsibilities.
                    </p>
                </div>
            </div>
        </div>
    )

    // Step 2: Business Type Selection
    const Step2BusinessType = () => (
        <div className="space-y-6">
            <div className="text-center">
                <Building2 className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-bold">What type of business is this?</h2>
                <p className="text-muted-foreground">This helps us create the perfect analytics setup for you</p>
            </div>

            <div className="space-y-3">
                {Object.entries(businessTypes).map(([key, type]) => (
                    <div
                        key={key}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            formData.businessType === key
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => updateFormData('businessType', key)}
                    >
                        <h3 className="font-semibold">{type.name}</h3>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                ))}
            </div>
        </div>
    )

    // Step 3: Business Description
    const Step3BusinessDescription = () => (
        <div className="space-y-6">
            <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-bold">Tell us about your business</h2>
                <p className="text-muted-foreground">Help us understand your specific situation</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="businessDescription">Business Description</Label>
                    <Textarea
                        id="businessDescription"
                        placeholder="Describe your business, what you do, your target market, any unique aspects..."
                        value={formData.businessDescription}
                        onChange={(e) => updateFormData('businessDescription', e.target.value)}
                        rows={4}
                        className="resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                        This helps our AI create better recommendations for your specific business.
                    </p>
                </div>
            </div>
        </div>
    )

    // Step 4: Business Metrics
    const Step4BusinessMetrics = () => {
        const selectedBusinessType = businessTypes[formData.businessType as keyof typeof businessTypes]

        return (
            <div className="space-y-6">
                <div className="text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h2 className="text-2xl font-bold">Business Details</h2>
                    <p className="text-muted-foreground">
                        These details help us calculate the right KPIs for your {selectedBusinessType?.name.toLowerCase()}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedBusinessType?.metrics.map((metric) => (
                        <div key={metric.key} className="space-y-2">
                            <Label htmlFor={metric.key}>{metric.label}</Label>
                            <Input
                                id={metric.key}
                                type={metric.type}
                                placeholder={metric.placeholder}
                                value={formData.businessMetrics[metric.key] || ''}
                                onChange={(e) => updateBusinessMetric(metric.key, e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    // Step 5: Data Upload (Optional)
    const Step5DataUpload = () => (
        <div className="space-y-6">
            <div className="text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-bold">Upload Your Data (Optional)</h2>
                <p className="text-muted-foreground">
                    Upload a CSV file with your business data to get more personalized insights
                </p>
            </div>

            <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                    <div className="space-y-2">
                        <Label htmlFor="csvFile" className="cursor-pointer">
                            <span className="text-primary hover:underline">Click to upload</span> or drag and drop
                        </Label>
                        <Input
                            id="csvFile"
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <p className="text-xs text-muted-foreground">CSV files only</p>
                    </div>
                    {formData.csvFile && (
                        <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                            ✅ {formData.csvFile.name} uploaded successfully
                        </div>
                    )}
                </div>

                <div className="text-sm text-muted-foreground space-y-2">
                    <p><strong>Tip:</strong> Include columns like:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Date/timestamp</li>
                        <li>Revenue/sales amounts</li>
                        <li>Customer counts</li>
                        <li>Cost data</li>
                        <li>Any other business metrics</li>
                    </ul>
                    <p className="text-xs">Don't worry - you can always upload more data later!</p>
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <CardTitle>Business Setup</CardTitle>
                            <CardDescription>Step {currentStep} of {totalSteps}</CardDescription>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {Math.round(progress)}% Complete
                        </div>
                    </div>
                    <Progress value={progress} className="w-full" />
                </CardHeader>
                
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    
                    {renderStep()}
                    
                    <div className="flex justify-between mt-8">
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 1 || loading}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Previous
                        </Button>
                        
                        {currentStep === totalSteps ? (
                            <Button
                                onClick={handleCompleteSetup}
                                disabled={loading}
                                className="bg-gradient-to-r from-primary to-primary/80"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Setting up...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        Complete Setup
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button
                                onClick={nextStep}
                                disabled={!validateStep() || loading}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
