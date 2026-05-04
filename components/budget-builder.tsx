"use client"

import { useState } from "react"
import { useActiveProject } from "@/contexts/project-context"
import { Layers, PaintBucket, ChefHat, Bath, DoorOpen, Building2, Zap } from "lucide-react"
import type { LucideIcon } from "lucide-react"

type Tier = {
  label: string
  priceUSsqft: number
  priceUKsqm: number
  description: string
}

type BudgetCategory = {
  id: string
  name: string
  icon: LucideIcon
  tiers: Tier[]
}

const BUDGET_CATEGORIES: BudgetCategory[] = [
  {
    id: "flooring",
    name: "Flooring",
    icon: Layers,
    tiers: [
      { label: "Basic", priceUSsqft: 2, priceUKsqm: 20, description: "Ceramic tiles, standard grade" },
      { label: "Mid-range", priceUSsqft: 6, priceUKsqm: 55, description: "Porcelain or quality vinyl" },
      { label: "Premium", priceUSsqft: 14, priceUKsqm: 130, description: "Natural stone or marble" },
      { label: "Luxury", priceUSsqft: 24, priceUKsqm: 220, description: "Engineered hardwood, bespoke" },
    ],
  },
  {
    id: "walls",
    name: "Walls & Paint",
    icon: PaintBucket,
    tiers: [
      { label: "Basic", priceUSsqft: 1, priceUKsqm: 8, description: "Standard emulsion, 2 coats" },
      { label: "Mid-range", priceUSsqft: 2.5, priceUKsqm: 22, description: "Premium paint + plaster skim" },
      { label: "Premium", priceUSsqft: 6, priceUKsqm: 55, description: "Venetian plaster or feature wall" },
      { label: "Luxury", priceUSsqft: 14, priceUKsqm: 130, description: "Designer finish, wallcovering" },
    ],
  },
  {
    id: "kitchen",
    name: "Kitchen",
    icon: ChefHat,
    tiers: [
      { label: "Basic", priceUSsqft: 60, priceUKsqm: 550, description: "Flat-pack cabinets, laminate worktop" },
      { label: "Mid-range", priceUSsqft: 150, priceUKsqm: 1400, description: "Semi-custom units, stone worktop" },
      { label: "Premium", priceUSsqft: 300, priceUKsqm: 2800, description: "Custom cabinetry, quartz surfaces" },
      { label: "Luxury", priceUSsqft: 600, priceUKsqm: 5500, description: "Bespoke joinery, integrated appliances" },
    ],
  },
  {
    id: "bathrooms",
    name: "Bathrooms",
    icon: Bath,
    tiers: [
      { label: "Basic", priceUSsqft: 80, priceUKsqm: 750, description: "Standard suite, ceramic tiles" },
      { label: "Mid-range", priceUSsqft: 200, priceUKsqm: 1900, description: "Contemporary suite, porcelain" },
      { label: "Premium", priceUSsqft: 400, priceUKsqm: 3800, description: "Wet room, quality fixtures" },
      { label: "Luxury", priceUSsqft: 800, priceUKsqm: 7500, description: "Designer suite, heated floors" },
    ],
  },
  {
    id: "windows",
    name: "Windows & Doors",
    icon: DoorOpen,
    tiers: [
      { label: "Basic", priceUSsqft: 15, priceUKsqm: 140, description: "Vinyl double-glazed / uPVC" },
      { label: "Mid-range", priceUSsqft: 35, priceUKsqm: 320, description: "Fibreglass / aluminium frames" },
      { label: "Premium", priceUSsqft: 70, priceUKsqm: 650, description: "Wood-clad, triple glazed" },
      { label: "Luxury", priceUSsqft: 130, priceUKsqm: 1200, description: "Crittal-style steel / bespoke timber" },
    ],
  },
  {
    id: "mep",
    name: "MEP Services",
    icon: Zap,
    tiers: [
      { label: "Basic", priceUSsqft: 8, priceUKsqm: 75, description: "Partial replumb / rewire, essentials only" },
      { label: "Mid-range", priceUSsqft: 18, priceUKsqm: 170, description: "Full replumb and partial rewire" },
      { label: "Premium", priceUSsqft: 32, priceUKsqm: 295, description: "Full rewire + underfloor heating" },
      { label: "Luxury", priceUSsqft: 55, priceUKsqm: 510, description: "Smart home, HVAC, high-spec throughout" },
    ],
  },
  {
    id: "structural",
    name: "Structural Work",
    icon: Building2,
    tiers: [
      { label: "Basic", priceUSsqft: 5, priceUKsqm: 46, description: "Minor wall removal, standard RSJ" },
      { label: "Mid-range", priceUSsqft: 12, priceUKsqm: 110, description: "Multiple beams, chimney breast removal" },
      { label: "Premium", priceUSsqft: 25, priceUKsqm: 230, description: "Load-bearing restructure, underpinning" },
      { label: "Luxury", priceUSsqft: 45, priceUKsqm: 415, description: "Basement dig, major structural overhaul" },
    ],
  },
]

const TIER_COLORS = ["bg-emerald-100 text-emerald-700", "bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700", "bg-amber-100 text-amber-700"]

export function BudgetBuilder() {
  const { activeProject } = useActiveProject()
  const isGBP = activeProject?.currency?.toUpperCase() === "GBP"
  const symbol = isGBP ? "£" : "$"
  const areaUnit = isGBP ? "sqm" : "sqft"

  const [areaInput, setAreaInput] = useState(activeProject?.total_area?.toString() ?? "")
  const [selectedTiers, setSelectedTiers] = useState<Record<string, number>>(
    Object.fromEntries(BUDGET_CATEGORIES.map(c => [c.id, 1]))
  )

  const area = parseFloat(areaInput) || 0

  const lineItems = BUDGET_CATEGORIES.map(cat => {
    const tier = cat.tiers[selectedTiers[cat.id] ?? 1]
    const unitPrice = isGBP ? tier.priceUKsqm : tier.priceUSsqft
    return { cat, tier, total: unitPrice * area }
  })

  const grandTotal = lineItems.reduce((s, l) => s + l.total, 0)

  function fmtMoney(n: number) {
    if (n >= 1_000_000) return `${symbol}${(n / 1_000_000).toFixed(2)}M`
    if (n >= 1_000) return `${symbol}${(n / 1_000).toFixed(0)}K`
    return `${symbol}${n.toFixed(0)}`
  }

  return (
    <div className="space-y-4 pb-6">

      {/* Area input */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold text-foreground mb-1">Project area</p>
        <p className="text-xs text-muted-foreground mb-3">
          Enter your total floor area to calculate estimated costs across all categories.
        </p>
        <div className="flex items-center gap-2 max-w-xs">
          <input
            type="number"
            min="0"
            value={areaInput}
            onChange={e => setAreaInput(e.target.value)}
            placeholder="e.g. 1500"
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <span className="text-sm text-muted-foreground font-mono">{areaUnit}</span>
        </div>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {BUDGET_CATEGORIES.map(cat => {
          const selectedIdx = selectedTiers[cat.id] ?? 1
          const selectedTier = cat.tiers[selectedIdx]
          const unitPrice = isGBP ? selectedTier.priceUKsqm : selectedTier.priceUSsqft
          const Icon = cat.icon

          return (
            <div key={cat.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.6} />
                </div>
                <p className="text-[13px] font-semibold text-foreground">{cat.name}</p>
                <span className="ml-auto font-mono text-[11px] text-muted-foreground">
                  {symbol}{unitPrice}/{areaUnit}
                </span>
              </div>

              {/* Tier selector */}
              <div className="flex gap-1.5 mb-2.5">
                {cat.tiers.map((tier, idx) => (
                  <button
                    key={tier.label}
                    onClick={() => setSelectedTiers(prev => ({ ...prev, [cat.id]: idx }))}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
                      selectedIdx === idx
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>

              {/* Selected tier description */}
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                {selectedTier.description}
              </p>

              {/* Category subtotal */}
              {area > 0 && (
                <p className="mt-2 text-[11px] font-mono font-medium text-foreground">
                  Est. {fmtMoney(unitPrice * area)}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary card */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold text-foreground mb-3">Estimate summary</p>
        {area === 0 ? (
          <p className="text-xs text-muted-foreground py-2">Enter your project area above to see the estimate.</p>
        ) : (
          <>
            <div className="divide-y divide-border mb-3">
              {lineItems.map(({ cat, tier, total }) => (
                <div key={cat.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-[12.5px] text-foreground">{cat.name}</p>
                    <p className="text-[10px] text-muted-foreground">{tier.label} · {tier.description}</p>
                  </div>
                  <span className="font-mono text-[12.5px] text-foreground ml-4">{fmtMoney(total)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <p className="text-sm font-semibold text-foreground">Total estimate</p>
              <p className="font-serif text-2xl font-semibold text-foreground">{fmtMoney(grandTotal)}</p>
            </div>
            <p className="mt-3 text-[10px] text-muted-foreground leading-relaxed">
              Estimates are based on 2024/2025 market averages for the {isGBP ? "UK" : "US"} and exclude contingency, permits, and site-specific conditions. Actual costs may vary significantly for older homes. Use this as a starting point, not a fixed quote.
            </p>
          </>
        )}
      </div>

    </div>
  )
}
