"use client"

import { useOnboarding } from "@/contexts/onboarding-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// This is a dummy schema for UI validation only.
// In a real app, you would use a library like Stripe Elements which provides secure inputs.
const formSchema = z.object({
  cardholderName: z.string().min(1, "Cardholder name is required"),
  cardNumber: z.string().transform(val => val.replace(/\s/g, '')).refine(val => val.length === 16 && /^\d+$/.test(val), "Card number must be 16 digits"),
  expiryDate: z.string().refine(val => /^(0[1-9]|1[0-2])\/\d{2}$/.test(val), "Expiry must be in MM/YY format"),
  cvc: z.string().transform(val => val.replace(/\D/g, '')).refine(val => val.length === 3 && /^\d+$/.test(val), "CVC must be 3 digits"),
});

type FormData = z.infer<typeof formSchema>;

export default function OnboardingPaymentPage() {
  const { prevStep, updateData, data, startSubmitting, isSubmitting } = useOnboarding();
  const router = useRouter();

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardholderName: "",
      cardNumber: "",
      expiryDate: "",
      cvc: "",
    }
  });

  const formatCardNumber = (value: string) => {
    if (!value) return value;
    const numericValue = value.replace(/\D/g, ''); // Remove non-digits
    return numericValue.match(/.{1,4}/g)?.join(' ') || '';
  };

  const formatExpiryDate = (value: string) => {
    if (!value) return value;
    const numericValue = value.replace(/\D/g, ''); // Remove non-digits
    if (numericValue.length > 2) {
      return `${numericValue.slice(0, 2)}/${numericValue.slice(2, 4)}`;
    }
    return numericValue;
  };

  const onSubmit = async (formData: FormData) => {
    startSubmitting();
    toast.info("Processing payment and creating your account...");

    // Simulate payment confirmation
    updateData({ paymentConfirmed: true });

    try {
        // Clean card number for submission if needed, though zod transform handles it for validation
        const submissionData = {
          ...data,
          ...formData,
          cardNumber: formData.cardNumber.replace(/\s/g, ''), // Ensure cleaned number for backend
        };

        const response = await fetch("/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(submissionData),
        });

        const result = await response.json();
        console.log("Signup API response:", result); // Log the full response

        if (!response.ok) {
            throw new Error(result.error || "An unknown error occurred.");
        }

        toast.success("Welcome! Your account has been created.");
        
        // Redirect to the setup page
        router.push('/onboarding/setup');

    } catch (err) {
        // Display specific error from backend if available, otherwise generic message
        const errorMessage = (err as Error).message;
        toast.error(`Signup failed: ${errorMessage}`);
        // Here you might want to reset the submitting state or redirect to an error page
    }
  };

  const planDetails = {
    starter: { name: "Starter", price: "$20/month" },
    professional: { name: "Professional", price: "$80/month" },
  }

  const selectedPlan = data.plan ? planDetails[data.plan] : null;

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Complete Payment</CardTitle>
        <CardDescription>Start your {selectedPlan?.name || 'plan'} today.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
            {selectedPlan && (
                <div className="p-4 rounded-md bg-gray-100 dark:bg-gray-800 flex justify-between items-center">
                    <p className="font-bold">{selectedPlan.name} Plan</p>
                    <p className="font-bold">{selectedPlan.price}</p>
                </div>
            )}
             <div className="space-y-2">
                <Label htmlFor="cardholderName">Cardholder Name</Label>
                <Input id="cardholderName" {...register("cardholderName")} disabled={isSubmitting} />
                {errors.cardholderName && <p className="text-xs text-red-500">{errors.cardholderName.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Controller
                  name="cardNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="cardNumber"
                      placeholder="---- ---- ---- ----"
                      inputMode="numeric"
                      pattern="[0-9 ]*"
                      maxLength={19} // 16 digits + 3 spaces
                      disabled={isSubmitting}
                      onChange={(e) => {
                        const formattedValue = formatCardNumber(e.target.value);
                        field.onChange(formattedValue);
                      }}
                      onKeyDown={(e) => {
                        // Allow numbers, backspace, delete, arrow keys, tab
                        // Also allow copy/paste/cut shortcuts (Cmd/Ctrl + X, C, V)
                        if (!/[0-9]/.test(e.key) && ![8, 9, 37, 39, 46].includes(e.keyCode) && !e.metaKey && !e.ctrlKey) {
                          e.preventDefault();
                        }
                      }}
                    />
                  )}
                />
                {errors.cardNumber && <p className="text-xs text-red-500">{errors.cardNumber.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Controller
                      name="expiryDate"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="expiryDate"
                          placeholder="MM/YY"
                          inputMode="numeric"
                          pattern="[0-9/]*"
                          maxLength={5} // MM/YY
                          disabled={isSubmitting}
                          onChange={(e) => {
                            const formattedValue = formatExpiryDate(e.target.value);
                            field.onChange(formattedValue);
                          }}
                          onKeyDown={(e) => {
                            // Allow numbers, backspace, delete, arrow keys, tab, and '/'
                            if (!/[0-9\/]/.test(e.key) && ![8, 9, 37, 39, 46].includes(e.keyCode) && !e.metaKey && !e.ctrlKey) {
                              e.preventDefault();
                            }
                          }}
                        />
                      )}
                    />
                    {errors.expiryDate && <p className="text-xs text-red-500">{errors.expiryDate.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <Controller
                      name="cvc"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="cvc"
                          placeholder="---"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={3}
                          disabled={isSubmitting}
                          onChange={(e) => {
                            const numericValue = e.target.value.replace(/\D/g, ''); // Only allow digits
                            field.onChange(numericValue);
                          }}
                          onKeyDown={(e) => {
                            // Allow numbers, backspace, delete, arrow keys, tab
                            if (!/[0-9]/.test(e.key) && ![8, 9, 37, 39, 46].includes(e.keyCode) && !e.metaKey && !e.ctrlKey) {
                              e.preventDefault();
                            }
                          }}
                        />
                      )}
                    />
                    {errors.cvc && <p className="text-xs text-red-500">{errors.cvc.message}</p>}
                </div>
            </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="ghost" onClick={prevStep} disabled={isSubmitting}>Back</Button>
          <Button type="submit" disabled={!data.plan || isSubmitting}>
            {isSubmitting ? "Processing..." : "Start Trial"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}