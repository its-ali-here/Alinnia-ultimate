"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'

const steps = [
  {
    number: '01',
    title: 'Create your project',
    description:
      'Add your project details — type, scope, budget, and timeline. Alinnia sets up your full dashboard in seconds, ready to track from day one.',
    detail: ['Set budget & timeline', 'Choose construction type', 'Invite your contractor'],
  },
  {
    number: '02',
    title: 'Track everything in one place',
    description:
      'Monitor spend, materials, schedule, and punch list items from a single view. No spreadsheets, no chasing emails — everything updates in real time.',
    detail: ['Live budget vs. actual', 'Material cost vs. market', 'Phase & milestone tracking'],
  },
  {
    number: '03',
    title: 'Build with confidence',
    description:
      "Get alerts before problems become expensive. Know when you're over budget, when a delivery is late, or when a task needs sign-off.",
    detail: ['Overage warnings', 'Punch list sign-off', 'Document vault for permits & contracts'],
  },
]

export function HowItWorksSection() {
  const [active, setActive] = useState(0)

  return (
    <section id="how-it-works" className="w-full bg-card py-20 md:py-28">
      <div className="container px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <span className="mb-3 inline-block rounded-full bg-[hsl(var(--brand-soft))] px-3 py-1 text-xs font-medium text-primary">
            How it works
          </span>
          <h2 className="font-serif text-3xl font-semibold text-foreground md:text-4xl">
            Up and running in minutes
          </h2>
          <p className="mt-3 text-muted-foreground md:text-lg">No training required. No consultants.</p>
        </motion.div>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Step selectors */}
          <div className="flex flex-col gap-3">
            {steps.map((step, i) => (
              <motion.button
                key={step.number}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                onClick={() => setActive(i)}
                className={`group w-full rounded-xl border p-4 text-left transition-all duration-200 ${
                  active === i
                    ? 'border-primary/30 bg-[hsl(var(--brand-soft))] shadow-sm'
                    : 'border-border bg-card hover:border-border hover:bg-muted/60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full font-mono text-sm font-semibold transition-colors ${
                      active === i ? 'bg-primary text-white' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                    }`}
                  >
                    {step.number}
                  </span>
                  <div>
                    <p className={`font-semibold transition-colors ${active === i ? 'text-foreground' : 'text-foreground/80'}`}>
                      {step.title}
                    </p>
                    {active === i && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-1 text-sm text-muted-foreground"
                      >
                        {step.description}
                      </motion.p>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Detail panel */}
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-border bg-card p-8 shadow-sm"
          >
            <span className="font-mono text-4xl font-semibold text-primary/20">{steps[active].number}</span>
            <h3 className="font-serif mt-2 text-2xl font-semibold text-foreground">{steps[active].title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{steps[active].description}</p>
            <ul className="mt-6 space-y-2.5">
              {steps[active].detail.map((d) => (
                <li key={d} className="flex items-center gap-2.5 text-sm text-foreground">
                  <span className="flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                  {d}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
