"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function PricingSection() {
  return (
    <section id="pricing" className="w-full py-20 md:py-32 bg-[#EAE0D7] relative overflow-hidden">
      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
        >
          <Badge className="rounded-full px-4 py-1.5 text-sm font-medium bg-[#FF5A13]/20 text-[#FF5A13]" variant="secondary">
            Pricing
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black">Simple, Transparent Pricing</h2>
          <p className="max-w-[800px] text-black md:text-lg">
            Start your first project for free. No hidden fees.
          </p>
        </motion.div>

        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-md"
          >
            <Card className="relative overflow-hidden h-full bg-white shadow-lg border-2 border-[#FF5A13]">
              <CardHeader>
                <CardTitle className="text-black">Project Pass</CardTitle>
                <CardDescription className="text-black">All features, one simple price.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 flex flex-col h-full">
                <div className="flex items-baseline mt-4">
                  <span className="text-5xl font-bold text-black">$79</span>
                  <span className="text-black ml-2">/ project</span>
                </div>
                <p className="mt-4 text-black font-semibold">7-day free trial for your first project.</p>
                <ul className="space-y-3 my-8 flex-grow">
                  {[
                    "Project Tracking",
                    "Financial Management",
                    "Actionable Insights",
                    "Advanced Reporting & Analytics",
                    "Price Intelligence",
                    "Priority Email & Chat Support",
                  ].map((feature, j) => (
                    <li key={j} className="flex items-center text-black">
                      <Check className="mr-2 size-4 text-[#FF5A13]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup">
                  <Button
                    className="w-full mt-auto rounded-full bg-[#FF5A13] text-black hover:bg-[#FF7A33]"
                  >
                    Start Your Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}