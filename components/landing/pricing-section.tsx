"use client"

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const features = [
  'Budget & cash flow tracking',
  'Materials cost vs. market',
  'Timeline & milestone tracking',
  'Punch list with photo attachments',
  'Document vault (plans, permits, contracts)',
  'Price Check — market benchmarks',
  '3-day free trial, no card required',
]

export function PricingSection() {
  const [annual, setAnnual] = useState(false)
  const monthlyPrice = 99
  const annualPrice = 79

  return (
    <section id="pricing" className="w-full bg-card py-20 md:py-28">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <span className="mb-3 inline-block rounded-full bg-[hsl(var(--brand-soft))] px-3 py-1 text-xs font-medium text-primary">
            Pricing
          </span>
          <h2 className="font-serif text-3xl font-semibold text-foreground md:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-3 text-muted-foreground md:text-lg">One plan. All features. No hidden fees.</p>

          {/* Billing toggle */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-border bg-muted p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                !annual ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                annual ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Annual
              <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto max-w-md"
        >
          <div className="rounded-2xl border-2 border-primary/40 bg-card p-8 shadow-lg">
            <p className="text-sm font-semibold text-foreground">Project Pass</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Everything you need, per project.</p>

            <div className="mt-5 flex items-end gap-1.5">
              <motion.span
                key={annual ? 'annual' : 'monthly'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-serif text-5xl font-semibold text-foreground"
              >
                £{annual ? annualPrice : monthlyPrice}
              </motion.span>
              <span className="mb-1.5 text-sm text-muted-foreground">/ project</span>
            </div>
            {annual && (
              <p className="mt-1 text-xs text-emerald-600">Billed annually. £{annualPrice * 12}/yr.</p>
            )}

            <p className="mt-3 text-xs font-medium text-primary">3-day free trial for your first project.</p>

            <ul className="mt-6 space-y-2.5">
              {features.map((feat) => (
                <li key={feat} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 flex-shrink-0 text-primary" strokeWidth={2.5} />
                  {feat}
                </li>
              ))}
            </ul>

            <Link href="/start" className="mt-7 block">
              <button className="w-full rounded-full bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90">
                Start your free trial
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
