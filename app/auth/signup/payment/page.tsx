"use client"

import { useState } from "react";
import { useOnboarding } from "@/contexts/onboarding-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Check } from "lucide-react";

// This is a dummy schema for UI validation only.
// In a real app, you would use a library like Stripe Elements which provides secure inputs.
const formSchema = z.object({
  cardholderName: z.string().min(1, "Cardholder name is required"),
  cardNumber: z.string().transform(val => val.replace(/\s/g, '')).refine(val => val.length === 16 && /^\d+$/.test(val), "Card number must be 16 digits"),
  expiryDate: z.string().refine(val => /^(0[1-9]|1[0-2])\/\d{2}$/.test(val), "Expiry must be in MM/YY format"),
  cvc: z.string().transform(val => val.replace(/\D/g, '')).refine(val => val.length === 3 && /^\d+$/.test(val), "CVC must be 3 digits"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  zipCode: z.string().transform(val => val.replace(/\D/g, '')).refine(val => val.length === 5 && /^\d+$/.test(val), "ZIP code must be 5 digits"),
});

type FormData = z.infer<typeof formSchema>;

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica", "Côte d’Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", "Paraguay", "Palestine", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

const professionalPlan = {
  name: "Professional",
  description: "The Complete Package for your business.",
  prices: {
    monthly: { amount: "$39", interval: "/month" },
    annually: { amount: "$399", interval: "/year" },
  },
  features: [
    "Cash flow forecast",
    "Inventory flow",
    "What-If analysis",
    "Credit risk assessment",
    "Priority email support",
    "Spreadsheets/Google Sheets connection",
  ],
};

export default function OnboardingPaymentPage() {
  const { prevStep, updateData, data, startSubmitting, stopSubmitting, isSubmitting } = useOnboarding();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardholderName: "",
      cardNumber: "",
      expiryDate: "",
      cvc: "",
      address: "",
      city: data.city || "",
      country: data.country || "",
      zipCode: "",
    }
  });

  const formatCardNumber = (value: string) => {
    if (!value) return value;
    const numericValue = value.replace(/\D/g, '');
    return numericValue.match(/.{1,4}/g)?.join(' ') || '';
  };

  const formatExpiryDate = (value: string) => {
    if (!value) return value;
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length > 2) {
      return `${numericValue.slice(0, 2)}/${numericValue.slice(2, 4)}`;
    }
    return numericValue;
  };

  const onSubmit = async (formData: FormData) => {
    startSubmitting();
    toast.info("Processing payment and creating your account...");

    updateData({ paymentConfirmed: true, plan: `professional-${billingCycle}` });

    try {
        const submissionData = { ...data, ...formData };
        const response = await fetch("/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(submissionData),
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "An unknown error occurred.");

        toast.success("Welcome! Your account has been created.");
        router.push('/auth/signup/setup');

    } catch (err) {
        const errorMessage = (err as Error).message;
        toast.error(`Signup failed: ${errorMessage}`);
        stopSubmitting();
    }
  };

  const currentPrice = professionalPlan.prices[billingCycle];

  return (
    <div className="flex justify-center items-start gap-8 p-4 md:p-8">
      {/* Plan Details Column */}
      <div className="w-full max-w-md hidden lg:block">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>{professionalPlan.name}</CardTitle>
            <CardDescription>{professionalPlan.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-4 my-6">
              <Label htmlFor="billing-cycle" className={billingCycle === 'monthly' ? 'font-bold' : ''}>Monthly</Label>
              <Switch
                id="billing-cycle"
                checked={billingCycle === 'annually'}
                onCheckedChange={(checked) => setBillingCycle(checked ? 'annually' : 'monthly')}
              />
              <Label htmlFor="billing-cycle" className={billingCycle === 'annually' ? 'font-bold' : ''}>Annually</Label>
               <span className="text-xs font-semibold text-primary">(Save 15%)</span>
            </div>
            <div className="text-center mb-6">
              <span className="text-4xl font-bold">{currentPrice.amount}</span>
              <span className="text-muted-foreground">{currentPrice.interval}</span>
            </div>
            <ul className="space-y-3">
              {professionalPlan.features.map((feature, j) => (
                <li key={j} className="flex items-center">
                  <Check className="mr-2 size-4 text-primary" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Payment Form Column */}
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Complete Payment</CardTitle>
            <CardDescription>Start your {professionalPlan.name} plan today.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
               {/* New Toggle for Mobile */}
              <div className="flex items-center justify-center gap-4 my-4 lg:hidden">
                <Label htmlFor="billing-cycle-mobile" className={billingCycle === 'monthly' ? 'font-bold' : ''}>Monthly</Label>
                <Switch
                  id="billing-cycle-mobile"
                  checked={billingCycle === 'annually'}
                  onCheckedChange={(checked) => setBillingCycle(checked ? 'annually' : 'monthly')}
                />
                <Label htmlFor="billing-cycle-mobile" className={billingCycle === 'annually' ? 'font-bold' : ''}>Annually</Label>
                <span className="text-xs font-semibold text-primary">(Save 15%)</span>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input id="cardholderName" placeholder="Cardholder Name" {...register("cardholderName")} disabled={isSubmitting} />
                  {errors.cardholderName && <p className="text-xs text-red-500">{errors.cardholderName.message}</p>}
              </div>
              <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Controller name="cardNumber" control={control} render={({ field }) => ( <Input {...field} id="cardNumber" placeholder="---- ---- ---- ----" inputMode="numeric" maxLength={19} disabled={isSubmitting} onChange={(e) => field.onChange(formatCardNumber(e.target.value))} /> )}/>
                  {errors.cardNumber && <p className="text-xs text-red-500">{errors.cardNumber.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Controller name="expiryDate" control={control} render={({ field }) => ( <Input {...field} id="expiryDate" placeholder="MM/YY" inputMode="numeric" maxLength={5} disabled={isSubmitting} onChange={(e) => field.onChange(formatExpiryDate(e.target.value))} /> )}/>
                      {errors.expiryDate && <p className="text-xs text-red-500">{errors.expiryDate.message}</p>}
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Controller name="cvc" control={control} render={({ field }) => ( <Input {...field} id="cvc" placeholder="---" inputMode="numeric" maxLength={3} disabled={isSubmitting} onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))} /> )}/>
                      {errors.cvc && <p className="text-xs text-red-500">{errors.cvc.message}</p>}
                  </div>
              </div>
              <h3 className="text-lg font-semibold pt-4">Billing Address</h3>
              <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" placeholder="123 Main St" {...register("address")} disabled={isSubmitting} />
                  {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="City" {...register("city")} disabled={isSubmitting} />
                      {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Controller name="zipCode" control={control} render={({ field }) => ( <Input {...field} id="zipCode" placeholder="ZIP Code" inputMode="numeric" maxLength={5} disabled={isSubmitting} onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))} /> )}/>
                      {errors.zipCode && <p className="text-xs text-red-500">{errors.zipCode.message}</p>}
                  </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Controller name="country" control={control} render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                        <SelectTrigger><SelectValue placeholder="Select a country" /></SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                          {COUNTRIES.map((country) => ( <SelectItem key={country} value={country}>{country}</SelectItem> ))}
                        </SelectContent>
                      </Select>
                  )}/>
                  {errors.country && <p className="text-xs text-red-500">{errors.country.message}</p>}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="ghost" onClick={prevStep} disabled={isSubmitting}>Back</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : `Pay ${currentPrice.amount} and Start Trial`}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
