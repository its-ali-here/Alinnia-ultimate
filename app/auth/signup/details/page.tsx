"use client"

import { useOnboarding } from "@/contexts/onboarding-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";

const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  companyName: z.string().min(1, { message: "Company name is required." }),
  dataLocation: z.enum(['cloud', 'local', 'other']),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms and privacy policy." }),
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function OnboardingDetailsPage() {
  const { nextStep, prevStep, updateData, data } = useOnboarding();
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      companyName: data.companyName || "",
      dataLocation: data.dataLocation || "cloud",
      agreedToTerms: data.agreedToTerms || false,
    }
  });

  const onSubmit = (formData: FormData) => {
    updateData(formData);
    nextStep();
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Tell us about yourself</CardTitle>
        <CardDescription>Just a few more details to get you started.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="First name" {...register("firstName")} />
              {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="Last name" {...register("lastName")} />
              {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" placeholder="Company name" {...register("companyName")} />
            {errors.companyName && <p className="text-xs text-red-500">{errors.companyName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Where is your data stored?</Label>
            <Controller
              name="dataLocation"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cloud">CSVs/Spreadsheets/Google Sheets</SelectItem>
                    <SelectItem value="local">SQL Database</SelectItem>
                    <SelectItem value="other">Combination Of Both</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex items-start space-x-2 pt-2">
             <Controller
                name="agreedToTerms"
                control={control}
                render={({ field }) => (
                    <Checkbox
                        id="terms"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                    />
                )}
            />
            <Label htmlFor="terms" className="text-sm text-muted-foreground">
              I agree to Alinnia's <Link href="/extras/terms" className="underline">Terms of Service</Link> and <Link href="/extras/privacy" className="underline">Privacy Policy</Link>.
            </Label>
          </div>
           {errors.agreedToTerms && <p className="text-xs text-red-500 pt-1">{errors.agreedToTerms.message}</p>}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="ghost" onClick={prevStep}>Back</Button>
          <Button type="submit">Continue</Button>
        </CardFooter>
      </form>
    </Card>
  );
}