import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DollarSign, BarChart2, Shield, Settings, Users, Cloud } from "lucide-react";
import React from "react";

const features = [
  {
    icon: <BarChart2 className="h-8 w-8 text-primary" />,
    title: "Advanced Analytics",
    description: "Gain deep insights into your business performance with powerful and customizable analytics dashboards.",
  },
  {
    icon: <DollarSign className="h-8 w-8 text-primary" />,
    title: "Financial Management",
    description: "Effortlessly track income, expenses, and cash flow to maintain a healthy financial outlook.",
  },
  {
    icon: <Shield className="h-8 w-8 text-primary" />,
    title: "Secure Data Handling",
    description: "Your data is protected with enterprise-grade security measures and regular audits.",
  },
  {
    icon: <Settings className="h-8 w-8 text-primary" />,
    title: "Customizable Workflows",
    description: "Tailor the platform to fit your unique business processes and team structure.",
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "Collaborative Tools",
    description: "Facilitate seamless teamwork with integrated sharing and communication features.",
  },
  {
    icon: <Cloud className="h-8 w-8 text-primary" />,
    title: "Cloud-Based Accessibility",
    description: "Access your business intelligence from anywhere, at any time, on any device.",
  },
];

export function FeaturesGridSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary/20 px-3 py-1 text-sm font-semibold text-primary">
              Key Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Unlock Your Business Potential
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Discover how Alinnia provides the tools you need to make smarter decisions and drive growth.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 xl:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="flex flex-col items-center p-6 text-center">
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
