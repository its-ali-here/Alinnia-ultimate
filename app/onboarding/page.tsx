"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Loader2, Building2, UserPlus, ChevronLeft, ChevronRight, Target, Sparkles, Database } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

export default function OnboardingPage() {
    const { user, organizationId, loading: authLoading, refreshOrganization } = useAuth()
    const router = useRouter()

    // Flow state management
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Organization choice state
    const [orgType, setOrgType] = useState<"new" | "existing">("new")
    const [orgCode, setOrgCode] = useState("")
    const [designation, setDesignation] = useState("")

    // Organization details state
    const [orgName, setOrgName] = useState("")
    const [phone, setPhone] = useState("")
    const [email, setEmail] = useState("")
    const [companySize, setCompanySize] = useState("")
    const [city, setCity] = useState("")
    const [country, setCountry] = useState("")

    // Industry selection state
    const [selectedIndustry, setSelectedIndustry] = useState("")
    const [selectedNiche, setSelectedNiche] = useState("")

    // Goals state
    const [selectedGoals, setSelectedGoals] = useState<string[]>([])

    // AI recommendations state
    const [aiRecommendations, setAiRecommendations] = useState<any>(null)
    const [selectedDashboards, setSelectedDashboards] = useState<string[]>([])

    // Data source state
    const [wantsDataSource, setWantsDataSource] = useState<boolean | null>(null)

    // Industry data
    const industries = [
        { id: "healthcare", name: "Healthcare", icon: "🏥", niches: [
            { id: "pharmacy", name: "Pharmacy", description: "Prescription dispensing and pharmaceutical services" },
            { id: "clinic", name: "Medical Clinic", description: "Primary care and specialized medical services" },
            { id: "dental", name: "Dental Practice", description: "Dental care and oral health services" },
            { id: "other", name: "Other Healthcare", description: "Other healthcare services" }
        ]},
        { id: "food", name: "Food & Beverage", icon: "🍽️", niches: [
            { id: "restaurant", name: "Restaurant", description: "Full-service dining establishment" },
            { id: "cafe", name: "Café/Coffee Shop", description: "Coffee, light meals, and beverages" },
            { id: "fastfood", name: "Fast Food", description: "Quick service restaurant" },
            { id: "other", name: "Other Food Service", description: "Other food and beverage services" }
        ]},
        { id: "retail", name: "Retail", icon: "🛍️", niches: [
            { id: "clothing", name: "Clothing Store", description: "Fashion and apparel retail" },
            { id: "electronics", name: "Electronics", description: "Consumer electronics and gadgets" },
            { id: "grocery", name: "Grocery Store", description: "Food and household essentials" },
            { id: "other", name: "Other Retail", description: "Other retail services" }
        ]},
        { id: "automotive", name: "Automotive", icon: "🚗", niches: [
            { id: "repair", name: "Auto Repair Shop", description: "Vehicle maintenance and repair services" },
            { id: "dealership", name: "Car Dealership", description: "Vehicle sales and services" },
            { id: "parts", name: "Auto Parts", description: "Automotive parts and accessories" },
            { id: "other", name: "Other Automotive", description: "Other automotive services" }
        ]},
        { id: "other", name: "Other", icon: "💼", niches: [
            { id: "consulting", name: "Consulting", description: "Professional consulting services" },
            { id: "technology", name: "Technology", description: "Software and IT services" },
            { id: "education", name: "Education", description: "Educational services and training" },
            { id: "other", name: "Other Business", description: "Other business services" }
        ]}
    ]

    // Goals data
    const businessGoals = [
        { id: "increase_sales", name: "Increase Sales", description: "Boost revenue and sales performance", icon: "📈" },
        { id: "improve_profit", name: "Improve Profit Margins", description: "Optimize costs and increase profitability", icon: "💰" },
        { id: "customer_satisfaction", name: "Enhance Customer Satisfaction", description: "Improve customer experience and retention", icon: "😊" },
        { id: "operational_efficiency", name: "Operational Efficiency", description: "Streamline processes and reduce waste", icon: "⚡" },
        { id: "market_expansion", name: "Market Expansion", description: "Enter new markets and grow customer base", icon: "🌍" },
        { id: "cost_reduction", name: "Cost Reduction", description: "Lower operational and overhead costs", icon: "💸" },
        { id: "quality_improvement", name: "Quality Improvement", description: "Enhance product or service quality", icon: "⭐" },
        { id: "team_productivity", name: "Team Productivity", description: "Improve employee performance and efficiency", icon: "👥" }
    ]

    // Company size options
    const companySizes = [
        { id: "1-10", name: "1-10 employees" },
        { id: "11-50", name: "11-50 employees" },
        { id: "51-200", name: "51-200 employees" },
        { id: "201-500", name: "201-500 employees" },
        { id: "500+", name: "500+ employees" }
    ]

    const totalSteps = orgType === "new" ? 6 : 1
    const progress = (currentStep / totalSteps) * 100

    // Redirect logic
    useEffect(() => {
        if (authLoading) return

        if (!user) {
            router.push('/auth/login')
            return
        }

        // If user has organization, go to dashboard
        if (organizationId) {
            router.push('/dashboard')
            return
        }
    }, [authLoading, user, organizationId, router])

    // Step navigation
    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1)
            setError(null)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
            setError(null)
        }
    }

    // Validation for each step
    const validateStep = () => {
        switch (currentStep) {
            case 1: // Organization choice
                return orgType === "existing" ? orgCode.trim() && designation.trim() : orgName.trim()
            case 2: // Organization details
                return orgName.trim() && email.trim() && companySize && city.trim() && country.trim()
            case 3: // Industry selection
                return selectedIndustry && selectedNiche
            case 4: // Goals selection
                return selectedGoals.length > 0
            case 5: // AI recommendations
                return selectedDashboards.length > 0
            case 6: // Data source
                return wantsDataSource !== null
            default:
                return false
        }
    }

    // Generate AI recommendations
    const generateAIRecommendations = async () => {
        setLoading(true)
        try {
            // Simulate AI analysis
            await new Promise(resolve => setTimeout(resolve, 2000))

            const selectedIndustryData = industries.find(i => i.id === selectedIndustry)
            const selectedNicheData = selectedIndustryData?.niches.find(n => n.id === selectedNiche)

            // Mock AI recommendations based on industry and goals
            const recommendations = {
                dashboards: [
                    { id: "sales", name: "Sales Performance", description: "Track revenue, conversions, and sales trends", recommended: selectedGoals.includes("increase_sales") },
                    { id: "financial", name: "Financial Overview", description: "Monitor profit margins, expenses, and cash flow", recommended: selectedGoals.includes("improve_profit") },
                    { id: "operations", name: "Operations Dashboard", description: "Optimize processes and track efficiency metrics", recommended: selectedGoals.includes("operational_efficiency") },
                    { id: "customer", name: "Customer Analytics", description: "Analyze customer satisfaction and retention", recommended: selectedGoals.includes("customer_satisfaction") },
                    { id: "team", name: "Team Performance", description: "Monitor employee productivity and performance", recommended: selectedGoals.includes("team_productivity") }
                ].filter(d => d.recommended || Math.random() > 0.5),
                insights: `Based on your ${selectedNicheData?.name} business and goals, we recommend focusing on ${selectedGoals.slice(0, 2).join(" and ")}.`
            }

            setAiRecommendations(recommendations)
            setSelectedDashboards(recommendations.dashboards.filter(d => d.recommended).map(d => d.id))
            nextStep()
        } catch (err) {
            setError("Failed to generate recommendations")
        } finally {
            setLoading(false)
        }
    }

    // Handle creating new organization
    const handleCreateOrganization = async () => {
        setError(null)
        setLoading(true)

        try {
            const response = await fetch("/api/organization/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user!.id,
                    orgName: orgName.trim(),
                    designation: designation || "Owner",
                    phone: phone || null,
                    email: email.trim(),
                    companySize,
                    city: city.trim(),
                    country: country.trim(),
                    industry: selectedIndustry,
                    niche: selectedNiche,
                    goals: selectedGoals,
                    selectedDashboards,
                    wantsDataSource
                }),
            })

            if (!response.ok) {
                const result = await response.json()
                throw new Error(result.error || "Failed to create organization")
            }

            await refreshOrganization()
            toast.success("🎉 Organization created successfully!")
            router.push('/dashboard')
        } catch (err) {
            setError((err as Error).message)
            toast.error((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    // Handle joining existing organization
    const handleJoinOrganization = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            if (!orgCode.trim()) {
                throw new Error("Organization code is required")
            }

            const response = await fetch("/api/organization/join", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user!.id,
                    orgCode: orgCode.toUpperCase(),
                    designation: designation || "Member"
                }),
            })

            if (!response.ok) {
                const result = await response.json()
                throw new Error(result.error || "Failed to join organization")
            }

            await refreshOrganization()
            toast.success("🎉 Successfully joined organization!")
            router.push('/dashboard')
        } catch (err) {
            setError((err as Error).message)
            toast.error((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    // Step 1: Organization Choice
    const renderOrganizationChoice = () => {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h2 className="text-2xl font-bold">Let's get started</h2>
                    <p className="text-muted-foreground">Create a new organization or join an existing one</p>
                </div>

                <RadioGroup value={orgType} onValueChange={(v) => setOrgType(v as any)} className="space-y-3">
                    <Label className="flex items-start space-x-3 p-4 border rounded-lg has-[input:checked]:border-primary cursor-pointer">
                        <RadioGroupItem value="new" id="new" className="mt-1" />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Building2 className="h-4 w-4" />
                                <span className="font-medium">Create New Organization</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Start fresh with your own organization</p>
                        </div>
                    </Label>

                    <Label className="flex items-start space-x-3 p-4 border rounded-lg has-[input:checked]:border-primary cursor-pointer">
                        <RadioGroupItem value="existing" id="existing" className="mt-1" />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <UserPlus className="h-4 w-4" />
                                <span className="font-medium">Join Existing Organization</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Join your team using an organization code</p>
                        </div>
                    </Label>
                </RadioGroup>

                {orgType === "new" && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="orgName">Organization Name</Label>
                            <Input
                                id="orgName"
                                type="text"
                                placeholder="Enter organization name"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={nextStep} disabled={!validateStep()}>
                                Next
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // Step 2: Organization Details
    const renderOrganizationDetails = () => {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <Building2 className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h2 className="text-2xl font-bold">Tell us about your organization</h2>
                    <p className="text-muted-foreground">Help us customize your experience</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="organization@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="companySize">Company Size *</Label>
                        <Select value={companySize} onValueChange={setCompanySize}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select company size" />
                            </SelectTrigger>
                            <SelectContent>
                                {companySizes.map((size) => (
                                    <SelectItem key={size.id} value={size.id}>
                                        {size.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="city">City *</Label>
                        <Input
                            id="city"
                            type="text"
                            placeholder="New York"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="country">Country *</Label>
                        <Input
                            id="country"
                            type="text"
                            placeholder="United States"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            required
                        />
                    </div>
                </div>
            </div>
        )
    }

    // Step 3: Industry Selection
    const renderIndustrySelection = () => {
        const selectedIndustryData = industries.find(i => i.id === selectedIndustry)

        return (
            <div className="space-y-6">
                <div className="text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h2 className="text-2xl font-bold">What's your industry?</h2>
                    <p className="text-muted-foreground">This helps us provide relevant insights and benchmarks</p>
                </div>

                <div className="space-y-4">
                    <Label>Select your industry</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {industries.map((industry) => (
                            <Label
                                key={industry.id}
                                className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                                    selectedIndustry === industry.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                                }`}
                                onClick={() => {
                                    setSelectedIndustry(industry.id)
                                    setSelectedNiche("") // Reset niche when industry changes
                                }}
                            >
                                <span className="text-2xl">{industry.icon}</span>
                                <span className="font-medium">{industry.name}</span>
                            </Label>
                        ))}
                    </div>
                </div>

                {selectedIndustryData && (
                    <div className="space-y-4">
                        <Label>Select your specific niche</Label>
                        <div className="grid grid-cols-1 gap-3">
                            {selectedIndustryData.niches.map((niche) => (
                                <Label
                                    key={niche.id}
                                    className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                                        selectedNiche === niche.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                                    }`}
                                    onClick={() => setSelectedNiche(niche.id)}
                                >
                                    <div className="flex-1">
                                        <div className="font-medium">{niche.name}</div>
                                        <div className="text-sm text-muted-foreground">{niche.description}</div>
                                    </div>
                                </Label>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // Step 4: Goals Selection
    const renderGoalsSelection = () => {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <Target className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h2 className="text-2xl font-bold">What are your main goals?</h2>
                    <p className="text-muted-foreground">Select the goals that matter most to your business (choose at least one)</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {businessGoals.map((goal) => (
                        <Label
                            key={goal.id}
                            className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                                selectedGoals.includes(goal.id) ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                            }`}
                        >
                            <Checkbox
                                checked={selectedGoals.includes(goal.id)}
                                onCheckedChange={(checked) => {
                                    if (checked) {
                                        setSelectedGoals([...selectedGoals, goal.id])
                                    } else {
                                        setSelectedGoals(selectedGoals.filter(g => g !== goal.id))
                                    }
                                }}
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-lg">{goal.icon}</span>
                                    <span className="font-medium">{goal.name}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{goal.description}</p>
                            </div>
                        </Label>
                    ))}
                </div>
            </div>
        )
    }

    // Show loading spinner
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    // Step 5: AI Recommendations
    const renderAIRecommendations = () => {
        if (!aiRecommendations) {
            return (
                <div className="space-y-6">
                    <div className="text-center">
                        <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
                        <h2 className="text-2xl font-bold">Generating your custom dashboards</h2>
                        <p className="text-muted-foreground">Our AI is analyzing your inputs to recommend the perfect dashboards</p>
                    </div>

                    <div className="flex justify-center">
                        <Button onClick={generateAIRecommendations} disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Generate Recommendations
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )
        }

        return (
            <div className="space-y-6">
                <div className="text-center">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h2 className="text-2xl font-bold">Your custom dashboard recommendations</h2>
                    <p className="text-muted-foreground">{aiRecommendations.insights}</p>
                </div>

                <div className="space-y-4">
                    <Label>Select the dashboards you'd like to set up</Label>
                    <div className="grid grid-cols-1 gap-3">
                        {aiRecommendations.dashboards.map((dashboard: any) => (
                            <Label
                                key={dashboard.id}
                                className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                                    selectedDashboards.includes(dashboard.id) ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                                }`}
                            >
                                <Checkbox
                                    checked={selectedDashboards.includes(dashboard.id)}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            setSelectedDashboards([...selectedDashboards, dashboard.id])
                                        } else {
                                            setSelectedDashboards(selectedDashboards.filter(d => d !== dashboard.id))
                                        }
                                    }}
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium">{dashboard.name}</span>
                                        {dashboard.recommended && (
                                            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                                                Recommended
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{dashboard.description}</p>
                                </div>
                            </Label>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    // Step 6: Data Source
    const renderDataSource = () => {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <Database className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h2 className="text-2xl font-bold">Connect your data</h2>
                    <p className="text-muted-foreground">Would you like to connect a data source to get started with real insights?</p>
                </div>

                <div className="space-y-4">
                    <Label>Choose an option</Label>
                    <div className="space-y-3">
                        <Label
                            className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                                wantsDataSource === true ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                            }`}
                            onClick={() => setWantsDataSource(true)}
                        >
                            <div className="flex-1">
                                <div className="font-medium">Yes, I'll connect a data source</div>
                                <p className="text-sm text-muted-foreground">Upload a CSV file or connect to your existing systems</p>
                            </div>
                        </Label>

                        <Label
                            className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                                wantsDataSource === false ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                            }`}
                            onClick={() => setWantsDataSource(false)}
                        >
                            <div className="flex-1">
                                <div className="font-medium">Skip for now</div>
                                <p className="text-sm text-muted-foreground">I'll set up data sources later from the dashboard</p>
                            </div>
                        </Label>
                    </div>
                </div>
            </div>
        )
    }

    // Join Organization Form
    const renderJoinOrganization = () => {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <UserPlus className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h2 className="text-2xl font-bold">Join your organization</h2>
                    <p className="text-muted-foreground">Enter your organization code to join your team</p>
                </div>

                <form onSubmit={handleJoinOrganization} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="orgCode">Organization Code</Label>
                        <Input
                            id="orgCode"
                            type="text"
                            placeholder="Enter 6-character code"
                            value={orgCode}
                            onChange={(e) => setOrgCode(e.target.value.toUpperCase())}
                            maxLength={6}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="designation">Your Role</Label>
                        <Input
                            id="designation"
                            type="text"
                            placeholder="e.g., Manager, Analyst, Staff"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Joining Organization...
                            </>
                        ) : (
                            "Join Organization"
                        )}
                    </Button>

                    <div className="text-center">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOrgType("new")}
                            className="text-sm"
                        >
                            Don't have a code? Create new organization
                        </Button>
                    </div>
                </form>
            </div>
        )
    }

    // Render step content
    const renderStepContent = () => {
        if (orgType === "existing") {
            return renderJoinOrganization()
        }

        switch (currentStep) {
            case 1:
                return renderOrganizationChoice()
            case 2:
                return renderOrganizationDetails()
            case 3:
                return renderIndustrySelection()
            case 4:
                return renderGoalsSelection()
            case 5:
                return renderAIRecommendations()
            case 6:
                return renderDataSource()
            default:
                return null
        }
    }

    // Show organization setup
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <CardTitle>Welcome to Alinnia</CardTitle>
                            <CardDescription>
                                {orgType === "new" ? `Step ${currentStep} of ${totalSteps}` : "Join your organization"}
                            </CardDescription>
                        </div>
                        {orgType === "new" && (
                            <div className="text-sm text-muted-foreground">
                                {Math.round(progress)}% Complete
                            </div>
                        )}
                    </div>
                    {orgType === "new" && <Progress value={progress} className="w-full" />}
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {renderStepContent()}

                    {/* Navigation buttons */}
                    {orgType === "new" && currentStep > 1 && (
                        <div className="flex justify-between mt-6">
                            <Button variant="outline" onClick={prevStep} disabled={loading}>
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Previous
                            </Button>
                            {currentStep < totalSteps ? (
                                <Button onClick={nextStep} disabled={!validateStep() || loading}>
                                    Next
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button onClick={handleCreateOrganization} disabled={!validateStep() || loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Organization"
                                    )}
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
