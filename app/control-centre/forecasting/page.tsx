"use client"

import { useState } from "react"
import { Search } from "lucide-react"

const aboveMarket = [
  { name: "Porcelain tile 12×24", detail: "You paid $4.20/sqft · Market avg $3.55", badge: "+18%" },
  { name: "Grout — sanded grey", detail: "You paid $18.00/bag · Market avg $16.50", badge: "+9%" },
]

const belowMarket = [
  { name: "Undermount sink", detail: "You paid $340 · Market avg $388", badge: "−12%" },
  { name: "Drywall screws 1-5/8\"", detail: "You paid $8.50 · Market avg $8.95", badge: "−5%" },
]

export default function PriceCheckPage() {
  const [query, setQuery] = useState("")
  const [searched, setSearched] = useState(false)

  const handleLookup = () => {
    if (query.trim()) setSearched(true)
  }

  return (
    <div className="space-y-3">
      {/* Search card */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold text-foreground mb-1">Price benchmark lookup</p>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
          Compare your costs against regional market averages before ordering. Prices are benchmarks — not quotes. Labor excluded.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            placeholder="e.g. porcelain tile, quartz countertop, vinyl plank…"
            className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-card transition-colors"
          />
          <button
            onClick={handleLookup}
            className="rounded-lg bg-primary px-3 py-2 text-[11px] font-medium text-white hover:opacity-90 transition-opacity"
          >
            Look up
          </button>
        </div>
      </div>

      {/* Example benchmark result (or searched result) */}
      {(searched || true) && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-sm font-semibold text-foreground mb-3">
            {searched ? query : "Porcelain tile 12×24"} — US regional avg.
          </p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-lg border border-border bg-muted/60 p-3">
              <p className="text-[10px] text-muted-foreground mb-1">Budget</p>
              <p className="font-mono text-base font-medium text-emerald-600">$2.80/sqft</p>
              <p className="text-[10px] text-muted-foreground mt-1">Basic grade</p>
            </div>
            <div className="rounded-lg border border-[hsl(var(--brand-light))] bg-[hsl(var(--brand-soft))] p-3">
              <p className="text-[10px] text-primary mb-1">Mid-range <span className="text-[9px]">← your purchase</span></p>
              <p className="font-mono text-base font-medium text-primary">$3.55/sqft</p>
              <p className="text-[10px] text-primary mt-1">You paid $4.20 (+18%)</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/60 p-3">
              <p className="text-[10px] text-muted-foreground mb-1">Premium</p>
              <p className="font-mono text-base font-medium text-muted-foreground">$7.50/sqft</p>
              <p className="text-[10px] text-muted-foreground mt-1">Designer / large format</p>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Based on regional supplier averages. ±20% variance expected. Does not include delivery, installation, or waste allowance.
          </p>
        </div>
      )}

      {/* Above market */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold text-foreground mb-3">Items priced above market</p>
        <div className="divide-y divide-border">
          {aboveMarket.map((item) => (
            <div key={item.name} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-[12.5px] text-foreground">{item.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.detail}</p>
              </div>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">{item.badge}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Below market */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <p className="text-sm font-semibold text-foreground">Items priced below market</p>
          <span className="text-[10px] text-emerald-600">Good deals ↓</span>
        </div>
        <div className="divide-y divide-border">
          {belowMarket.map((item) => (
            <div key={item.name} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-[12.5px] text-foreground">{item.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{item.detail}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">{item.badge}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
