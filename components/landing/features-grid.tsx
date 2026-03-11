import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Projector, Banknote, Users, ShieldCheck, AreaChart, Smartphone } from "lucide-react";
import React from "react";

const features = [
  {
    icon: <Projector className="h-8 w-8 text-[#FF5A13]" />,
    title: "Project Management",
    description: "Plan, schedule, and track every phase of your project, from pre-construction to closeout.",
  },
  {
    icon: <Banknote className="h-8 w-8 text-[#FF5A13]" />,
    title: "Financial Management",
    description: "Manage budgets, track costs, and forecast with confidence. Connect your accounting system for seamless data flow.",
  },
  {
    icon: <Users className="h-8 w-8 text-[#FF5A13]" />,
    title: "Workforce Management",
    description: "Optimize your field and office operations. Track time, manage schedules, and improve productivity.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-[#FF5A13]" />,
    title: "Safety & Quality",
    description: "Standardize your safety and quality processes. Conduct inspections, track issues, and mitigate risk.",
  },
  {
    icon: <AreaChart className="h-8 w-8 text-[#FF5A13]" />,
    title: "Analytics & Reporting",
    description: "Gain valuable insights into your projects and portfolio. Make data-driven decisions to improve performance.",
  },
  {
    icon: <Smartphone className="h-8 w-8 text-[#FF5A13]" />,
    title: "Mobile First",
    description: "Access your project data from anywhere, on any device. Keep your team connected and productive in the field.",
  },
];

export function FeaturesGridSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-[#EAE0D7]">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-[#FF5A13]/20 px-3 py-1 text-sm font-semibold text-[#FF5A13]">
              Key Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-black">
              A Single Platform for the Entire Project Lifecycle
            </h2>
            <p className="max-w-[900px] text-black md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Alinnia connects your entire project team, from the office to the field, on a single platform.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 lg:grid-cols-3 xl:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="flex flex-col items-center p-6 text-center bg-white shadow-md">
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle className="text-xl font-bold text-black">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-black">
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
