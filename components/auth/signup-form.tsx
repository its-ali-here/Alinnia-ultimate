// In components/auth/signup-form.tsx

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Building2, Users, AlertCircle, Loader2 } from "lucide-react";

export function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [orgType, setOrgType] = useState<'new' | 'existing'>('new');
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    orgName: "",
    orgId: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
      }
      setError("");
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          orgType: orgType,
          orgName: formData.orgName,
          orgId: formData.orgId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "An unknown error occurred.");
      }

      router.push(`/auth/login?message=${encodeURIComponent(result.message)}`);

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Create Your Account</h2>
                <p className="text-muted-foreground mt-1">First, let's get your personal details.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={formData.fullName} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} required />
              </div>
              <Button type="button" className="w-full" onClick={handleNext}>Next</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold">Set Up Your Organization</h2>
                <p className="text-muted-foreground mt-1">Create a new organization or join one.</p>
              </div>
              <RadioGroup value={orgType} onValueChange={(v) => setOrgType(v as any)} className="space-y-2">
                <Label className="flex items-center space-x-2 p-3 border rounded-lg has-[input:checked]:border-primary">
                  <RadioGroupItem value="new" id="new" />
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    <span>Create a new organization</span>
                  </div>
                </Label>
                <Label className="flex items-center space-x-2 p-3 border rounded-lg has-[input:checked]:border-primary">
                  <RadioGroupItem value="existing" id="existing" />
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>Join an existing organization</span>
                  </div>
                </Label>
              </RadioGroup>

              {orgType === 'new' ? (
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input id="orgName" value={formData.orgName} onChange={handleInputChange} placeholder="Acme Inc." required />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="orgId">Organization ID</Label>
                  <Input id="orgId" value={formData.orgId} onChange={handleInputChange} placeholder="Paste the organization UUID here" required />
                </div>
              )}
              <div className="flex justify-between mt-8">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Finish Signup
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}