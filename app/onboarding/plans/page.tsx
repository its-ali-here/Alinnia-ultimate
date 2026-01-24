"use client"

import { useOnboarding } from "@/contexts/onboarding-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OnboardingPlansPage() {
  const { nextStep, prevStep, updateData, data } = useOnboarding();
  const selectedPlan = data.plan;

  const handleSelectPlan = (plan: 'starter' | 'professional') => {
    updateData({ plan });
  };

  const handleNext = () => {
    if (selectedPlan) {
      nextStep();
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Choose your plan</CardTitle>
        <CardDescription>You can change your plan at any time.</CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-6">
        <div
          className={cn(
            "p-6 rounded-lg border cursor-pointer",
            selectedPlan === 'starter' ? "border-primary ring-2 ring-primary" : "border-border"
          )}
          onClick={() => handleSelectPlan('starter')}
        >
          <h3 className="text-lg font-bold">Starter</h3>
          <p className="text-sm text-muted-foreground">For individuals and small teams.</p>
          <div className="my-4">
            <span className="text-4xl font-bold">$24</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" />5 Users</li>
            <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" />5GB Storage</li>
            <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" />Basic Analytics</li>
          </ul>
        </div>
        <div
          className={cn(
            "p-6 rounded-lg border cursor-pointer",
            selectedPlan === 'professional' ? "border-primary ring-2 ring-primary" : "border-border"
          )}
          onClick={() => handleSelectPlan('professional')}
        >
          <h3 className="text-lg font-bold">Pro</h3>
          <p className="text-sm text-muted-foreground">For growing businesses.</p>
          <div className="my-4">
            <span className="text-4xl font-bold">$49</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" />Unlimited Users</li>
            <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" />50GB Storage</li>
            <li className="flex items-center"><Check className="h-4 w-4 mr-2 text-green-500" />Advanced Analytics & AI</li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button type="button" variant="ghost" onClick={prevStep}>Back</Button>
        <Button type="button" onClick={handleNext} disabled={!selectedPlan}>Continue</Button>
      </CardFooter>
    </Card>
  );
}