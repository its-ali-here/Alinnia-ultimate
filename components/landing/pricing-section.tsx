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
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black">Flexible Plans for Teams of All Sizes</h2>
          <p className="max-w-[800px] text-black md:text-lg">
            Choose the plan that's right for your business.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12 mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="relative overflow-hidden h-full bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-black">Pro</CardTitle>
                <CardDescription className="text-black">For small teams and growing businesses.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 flex flex-col h-full">
                <div className="flex items-baseline mt-4">
                  <span className="text-5xl font-bold text-black">$49</span>
                  <span className="text-black ml-2">/ user / month</span>
                </div>
                <ul className="space-y-3 my-8 flex-grow">
                  {[
                    "Project Management",
                    "Financial Management",
                    "Workforce Management",
                    "Standard Reporting",
                    "Email & Chat Support",
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
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="relative overflow-hidden h-full bg-white shadow-lg border-2 border-[#FF5A13]">
              <Badge className="absolute top-4 right-4 rounded-full px-4 py-1.5 text-sm font-medium bg-[#FF5A13] text-black">
                Most Popular
              </Badge>
              <CardHeader>
                <CardTitle className="text-black">Business</CardTitle>
                <CardDescription className="text-black">For established businesses and large teams.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 flex flex-col h-full">
                <div className="flex items-baseline mt-4">
                  <span className="text-5xl font-bold text-black">$99</span>
                  <span className="text-black ml-2">/ user / month</span>
                </div>
                <ul className="space-y-3 my-8 flex-grow">
                  {[
                    "Everything in Pro",
                    "Advanced Financials",
                    "Custom Reporting",
                    "API Access",
                    "Priority Support",
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
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="relative overflow-hidden h-full bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-black">Enterprise</CardTitle>
                <CardDescription className="text-black">For large organizations with custom needs.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 flex flex-col h-full">
                <div className="flex items-baseline mt-4">
                  <span className="text-4xl font-bold text-black">Custom</span>
                </div>
                <ul className="space-y-3 my-8 flex-grow">
                  {[
                    "Everything in Business",
                    "Dedicated Account Manager",
                    "Custom Integrations",
                    "On-Premise Deployment",
                    "24/7/365 Support",
                  ].map((feature, j) => (
                    <li key={j} className="flex items-center text-black">
                      <Check className="mr-2 size-4 text-[#FF5A13]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/contact-sales">
                  <Button
                    className="w-full mt-auto rounded-full bg-[#FF5A13] text-black hover:bg-[#FF7A33]"
                  >
                    Contact Sales
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