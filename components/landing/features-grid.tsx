"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Package, CheckSquare, FileText, ListOrdered, CircleDollarSign } from 'lucide-react'

const features = [
  {
    icon: TrendingUp,
    label: 'Budget & Cash Flow',
    headline: 'Know exactly where every dollar goes',
    description:
      'Track spending by category with a live budget vs. actual view. See committed costs, available funds, and every transaction — without touching a spreadsheet.',
    bullets: ['Spend by category breakdown', 'Committed vs. available budget', 'Transaction history with receipts'],
  },
  {
    icon: Package,
    label: 'Materials',
    headline: 'Stop overpaying for materials',
    description:
      'Log every purchase and instantly compare your price against regional market averages. Get flagged when a supplier is charging above market rate.',
    bullets: ['Per-item cost vs. market average', 'Quantity tracking by supplier', 'Shortage & delivery alerts'],
  },
  {
    icon: ListOrdered,
    label: 'Timeline',
    headline: 'Phases and milestones, visualised',
    description:
      'Break your project into phases — demolition, rough-in, finishes — and track progress milestone by milestone. Spot delays before they cascade.',
    bullets: ['Phase-by-phase progress', 'Milestone completion tracking', 'Overdue task alerts'],
  },
  {
    icon: CheckSquare,
    label: 'Punch List',
    headline: 'Nothing falls through the cracks',
    description:
      'The punch list is how you and your contractor agree work is done. Create items, assign status, attach photos, and share a signed-off report at handover.',
    bullets: ['Open / In Progress / Done filters', 'Photo attachments per item', 'Shareable contractor report'],
  },
  {
    icon: FileText,
    label: 'Files',
    headline: 'Every document, always findable',
    description:
      'Upload drawings, permits, contracts, receipts, and site photos into one organised vault. Share with your contractor in one link.',
    bullets: ['Plans, Permits, Contracts, Photos', 'Receipts linked to expenses', 'Cloud storage, any device'],
  },
  {
    icon: CircleDollarSign,
    label: 'Price Check',
    headline: 'Market pricing in your pocket',
    description:
      'Before you approve an invoice or place an order, look up regional benchmark pricing. Know whether the quote you got is fair.',
    bullets: ['Budget / mid-range / premium tiers', 'Flagged above-market items', 'No signup or subscription needed to check'],
  },
]

export function FeaturesGridSection() {
  const [active, setActive] = useState(0)
  const f = features[active]
  const Icon = f.icon

  return (
    <section id="features" className="w-full bg-muted py-20 md:py-28">
      <div className="container px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <span className="mb-3 inline-block rounded-full bg-[hsl(var(--brand-soft))] px-3 py-1 text-xs font-medium text-primary">
            Everything you need
          </span>
          <h2 className="font-serif text-3xl font-semibold text-foreground md:text-4xl">
            One dashboard. Every module.
          </h2>
          <p className="mt-3 text-muted-foreground md:text-lg">
            Built for the full lifecycle — from breaking ground to final sign-off.
          </p>
        </motion.div>

        {/* Tab pills */}
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {features.map((feat, i) => {
            const TabIcon = feat.icon
            return (
              <button
                key={feat.label}
                onClick={() => setActive(i)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  active === i
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-card text-foreground/70 border border-border hover:border-primary/30 hover:text-primary'
                }`}
              >
                <TabIcon className="h-3 w-3" strokeWidth={2} />
                {feat.label}
              </button>
            )
          })}
        </div>

        {/* Feature detail */}
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-8 shadow-sm"
        >
          <div className="flex items-start gap-5">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--brand-soft))]">
              <Icon className="h-5 w-5 text-primary" strokeWidth={1.7} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{f.label}</p>
              <h3 className="font-serif mt-1 text-xl font-semibold text-foreground">{f.headline}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              <ul className="mt-5 space-y-2">
                {f.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-2 text-sm text-foreground">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
