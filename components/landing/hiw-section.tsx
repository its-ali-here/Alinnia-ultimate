"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"

export function HowItWorksSection() {
  return (
    <section className="w-full py-20 md:py-32 bg-[#EAE0D7] relative overflow-hidden">
      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
        >
          <Badge className="rounded-full px-4 py-1.5 text-sm font-medium bg-[#FF5A13]/20 text-[#FF5A13]" variant="secondary">
            How It Works
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-black">Get Started in 3 Simple Steps</h2>
          <p className="max-w-[800px] text-black md:text-lg">
            Alinnia is designed to be intuitive and easy to use. Get your team up and running in minutes.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
          <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-black/20 -translate-y-1/2 z-0 border-t border-dashed border-black/50"></div>

          {[
            {
              step: "01",
              title: "Connect Your Team",
              description: "Invite your entire team, from the office to the field, to collaborate on a single platform.",
            },
            {
              step: "02",
              title: "Track Your Progress",
              description: "Monitor project performance in real-time. Track budgets, schedules, and quality from anywhere.",
            },
            {
              step: "03",
              title: "Build with Confidence",
              description: "Make data-driven decisions to improve efficiency, mitigate risk, and increase profitability.",
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative z-10 flex flex-col items-center text-center space-y-4"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FF5A13] text-black text-xl font-bold shadow-lg">
                {step.step}
              </div>
              <h3 className="text-xl font-bold text-black">{step.title}</h3>
              <p className="text-black">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}