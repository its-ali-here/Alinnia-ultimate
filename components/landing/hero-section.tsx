"use client"

import Link from 'next/link'
import { motion, useInView, animate } from 'framer-motion'
import { ArrowRight, CheckCircle2, TrendingUp, Package, CheckSquare } from 'lucide-react'
import { useEffect, useRef } from 'react'

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView || !ref.current) return
    const controls = animate(0, value, {
      duration: 1.6,
      ease: 'easeOut',
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.round(v).toString() + suffix
      },
    })
    return () => controls.stop()
  }, [inView, value, suffix])

  return <span ref={ref}>0{suffix}</span>
}

function MiniDashboard() {
  return (
    <div className="w-full rounded-2xl border border-border bg-card shadow-2xl overflow-hidden select-none">
      {/* Topbar */}
      <div className="flex h-10 items-center gap-2.5 border-b border-border bg-card px-3">
        <span className="font-serif text-[11px] font-semibold text-primary tracking-widest">ALINNIA</span>
        <div className="h-3.5 w-px bg-border" />
        <span className="text-[10px] font-medium text-foreground">Kitchen Renovation · 2025</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[62%] rounded-full bg-primary" />
          </div>
          <span className="font-mono text-[9px] text-muted-foreground">62%</span>
          <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8px] font-semibold text-emerald-700">On Track</span>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="flex w-9 flex-col items-center gap-1 border-r border-border bg-background py-2">
          {[{ Icon: TrendingUp, active: true }, { Icon: Package }, { Icon: CheckSquare }].map(({ Icon, active }, i) => (
            <div
              key={i}
              className={`flex h-6 w-6 items-center justify-center rounded-[5px] ${active ? 'bg-[hsl(var(--brand-soft))] text-primary' : 'text-muted-foreground'}`}
            >
              <Icon className="h-3 w-3" strokeWidth={1.8} />
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-background p-2 space-y-1.5">
          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: 'Budget used', value: '$34.2K', sub: '62%', subColor: 'text-amber-600' },
              { label: 'Days left', value: '28', sub: 'Aug 15', subColor: 'text-muted-foreground' },
              { label: 'Tasks done', value: '19/34', sub: '56%', subColor: 'text-emerald-600' },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-border bg-card p-1.5">
                <p className="text-[7px] text-muted-foreground">{s.label}</p>
                <p className="font-serif text-xs font-semibold text-foreground leading-tight">{s.value}</p>
                <p className={`text-[7px] ${s.subColor}`}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Budget bar */}
          <div className="rounded-lg border border-border bg-card p-1.5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[7px] text-muted-foreground">Budget overview</p>
              <span className="rounded-full bg-muted px-1 py-0.5 text-[6px] text-muted-foreground">$12K remaining</span>
            </div>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="bg-primary" style={{ width: '62%' }} />
              <div className="bg-[hsl(var(--brand-light))] opacity-70" style={{ width: '16%' }} />
            </div>
          </div>

          {/* Action items */}
          <div className="rounded-lg border border-border bg-card p-1.5">
            <p className="text-[7px] text-muted-foreground mb-1">Needs attention</p>
            {[
              { text: 'Confirm tile delivery — Acme Supply', badge: 'Due today', badgeColor: 'bg-amber-100 text-amber-700' },
              { text: 'Schedule electrical inspection', badge: 'Aug 2', badgeColor: 'bg-[hsl(var(--brand-soft))] text-primary' },
              { text: 'Sign cabinet contract — KBF Designs', badge: 'Aug 5', badgeColor: 'bg-muted text-muted-foreground' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1 py-0.5">
                <div className="h-2 w-2 flex-shrink-0 rounded border border-muted-foreground/30" />
                <p className="flex-1 text-[7px] text-foreground truncate">{item.text}</p>
                <span className={`rounded-full px-1 py-0.5 text-[6px] font-medium ${item.badgeColor}`}>{item.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const stats = [
  { value: 500, suffix: '+', label: 'Projects managed' },
  { value: 12, suffix: '%', label: 'Average budget saved' },
  { value: 40, suffix: '+', label: 'Countries' },
]

const trust = [
  'Track budgets & materials in real time',
  'Keep your timeline on track',
  'One place for all project documents',
]

export function HeroSection() {
  return (
    <section className="w-full overflow-hidden bg-muted py-16 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-6"
          >
            <span className="inline-flex w-fit items-center rounded-full border border-primary/30 bg-[hsl(var(--brand-soft))] px-3 py-1 text-xs font-medium text-primary">
              Built for homeowners around the globe
            </span>

            <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Your project.<br />
              <span className="text-primary">Under control.</span>
            </h1>

            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              Alinnia is the all-in-one remodelling dashboard for homeowners — track budgets, materials, timelines, and punch lists from a single, beautiful interface.
            </p>

            <ul className="space-y-2">
              {trust.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" strokeWidth={1.8} />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/start"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Start your project free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                See how it works
              </Link>
            </div>

            {/* Animated stats */}
            <div className="flex gap-6 border-t border-border pt-6">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-serif text-2xl font-semibold text-foreground">
                    <AnimatedNumber value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — mini dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            {/* Floating badge — top left */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="absolute -left-4 -top-4 z-10 rounded-xl border border-border bg-card px-3 py-2 shadow-lg"
            >
              <p className="text-[10px] text-muted-foreground">Budget health</p>
              <p className="font-serif text-base font-semibold text-emerald-600">On Track ↑</p>
            </motion.div>

            {/* Floating badge — bottom right */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.4 }}
              className="absolute -bottom-4 -right-4 z-10 rounded-xl border border-border bg-card px-3 py-2 shadow-lg"
            >
              <p className="text-[10px] text-muted-foreground">Phase 2 of 3</p>
              <p className="font-mono text-base font-semibold text-primary">62% done</p>
            </motion.div>

            <MiniDashboard />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
