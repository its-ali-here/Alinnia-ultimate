"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

export default function OnboardingSetupPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/dashboard');
    }, 10000); // 10 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [router]);

  return (
    <div className="w-full max-w-2xl text-center">
        <div className='flex items-center justify-center mb-4'>
            <Loader2 className="h-8 w-8 mr-4 animate-spin" />
            <h1 className="text-3xl font-bold">We're Setting Up Your Database</h1>
        </div>
        <p className="text-muted-foreground mb-8">
            This should only take a few moments. In the meantime, here's a quick tutorial to get you started.
        </p>
        
        <Card>
            <CardContent className="p-4">
                <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-md flex items-center justify-center">
                    {/* YouTube embed will go here */}
                    <p className="text-muted-foreground">YouTube Tutorial Placeholder</p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}