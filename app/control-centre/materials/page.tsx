"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"

const materials = [
  { item: "Porcelain tile 12×24", supplier: "Acme Supply · Jul 12", qty: "280 sqft", unit: "$4.20", total: "$1,176", market: "+18%", marketColor: "amber" },
  { item: "Quartz countertop", supplier: "Stone World · Jul 8", qty: "42 sqft", unit: "$85.00", total: "$3,570", market: "~2%", marketColor: "neutral" },
  { item: "Undermount sink", supplier: "Wayfair · Jul 5", qty: "1 unit", unit: "$340", total: "$340", market: "−12%", marketColor: "green" },
  { item: "Cabinet pulls (32mm)", supplier: "Hardware Hub · Jul 4", qty: "24 pcs", unit: "$6.50", total: "$156", market: "~1%", marketColor: "neutral" },
  { item: "Grout — sanded grey", supplier: "Home Depot · Jul 3", qty: "8 bags", unit: "$18.00", total: "$144", market: "+9%", marketColor: "amber" },
  { item: "Hardibacker 3×5", supplier: "Lowe's · Jul 2", qty: "12 pcs", unit: "$14.00", total: "$168", market: "~3%", marketColor: "neutral" },
  { item: "Drywall screws 1-5/8\"", supplier: "Lowe's · Jul 2", qty: "2 boxes", unit: "$8.50", total: "$17", market: "−5%", marketColor: "green" },
]

const badgeClass: Record<string, string> = {
  amber: "bg-amber-100 text-amber-700",
  green: "bg-emerald-100 text-emerald-700",
  neutral: "bg-muted text-muted-foreground",
}

export default function MaterialsPage() {
  const [search, setSearch] = useState("")
  const filtered = materials.filter((m) =>
    m.item.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-3">
      {/* Search + add */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search materials…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-card transition-colors"
        />
        <button className="rounded-lg bg-primary px-3 py-2 text-[11px] font-medium text-white hover:opacity-90 transition-opacity">
          + Add item
        </button>
      </div>

      {/* Alert */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
        <span>2 items priced above regional market average. Check Price Check for details.</span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/60">
              <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Item</th>
              <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Qty</th>
              <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Unit cost</th>
              <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Total</th>
              <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">vs. Market</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((m) => (
              <tr key={m.item} className="hover:bg-muted/40 transition-colors">
                <td className="px-3 py-2.5">
                  <p className="text-foreground">{m.item}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{m.supplier}</p>
                </td>
                <td className="px-3 py-2.5 text-right font-mono text-[11px] text-foreground">{m.qty}</td>
                <td className="px-3 py-2.5 text-right font-mono text-[11px] text-foreground">{m.unit}</td>
                <td className="px-3 py-2.5 text-right font-mono text-[11px] text-foreground">{m.total}</td>
                <td className="px-3 py-2.5 text-right">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeClass[m.marketColor]}`}>
                    {m.market}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] text-muted-foreground">Market indicators use regional averages. Not a quote. Labor not included. ±20% variance expected.</p>
    </div>
  )
}
