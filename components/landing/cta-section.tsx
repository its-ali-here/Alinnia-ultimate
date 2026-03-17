"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaSection() {
  return (
    <section className="w-full py-20 md:py-32 bg-[#FF5A13] text-black relative overflow-hidden">
      <div className="container px-4 md:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-6 text-center"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Ready to Build, Better?
          </h2>
          <p className="mx-auto max-w-[700px] md:text-xl">
            Take control of your projects and build with confidence. Get started with Alinnia today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link href="/auth/signup">
              <Button size="lg" className="rounded-full h-12 px-8 text-base bg-black text-white hover:bg-black/80">
                Start Your Project
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}