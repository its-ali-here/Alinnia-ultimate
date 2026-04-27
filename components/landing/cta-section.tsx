"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function CtaSection() {
  return (
    <section className="w-full bg-primary py-20 md:py-28">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-serif text-3xl font-semibold text-white md:text-4xl lg:text-5xl">
            Ready to build, better?
          </h2>
          <p className="mt-4 text-base text-white/75 md:text-lg">
            Start your first project free. No card required. Up and running in minutes.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/auth/signup">
              <button className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90">
                Start your project
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link href="#features">
              <button className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10">
                See all features
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
