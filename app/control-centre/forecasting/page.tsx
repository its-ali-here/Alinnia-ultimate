"use client"

import { useState } from "react"
import { useActiveProject } from "@/contexts/project-context"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import { searchPriceIntelligence, getProjectExpenses } from "@/lib/project-queries"
import type { PriceIntelligence, Expense } from "@/lib/project-queries"
import { Search } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { BudgetBuilder } from "@/components/budget-builder"

function fmt(n: number, unit: string) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/${unit}`
}

function tierFromResults(results: PriceIntelligence[]) {
  if (results.length === 0) return null
  const prices = results.map(r => r.price).sort((a, b) => a - b)
  const budget = prices[0]
  const premium = prices[prices.length - 1]
  const mid = prices[Math.floor(prices.length / 2)]
  const unit = results[0].unit
  return { budget, mid, premium, unit, results }
}

function PriceCheckContent() {
  const { activeProject } = useActiveProject()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PriceIntelligence[] | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleLookup = async () => {
    if (!query.trim()) return
    setSearching(true)
    const supabase = createSupabaseBrowserClient()
    const [prices, exps] = await Promise.all([
      searchPriceIntelligence(supabase, query, activeProject?.city),
      activeProject ? getProjectExpenses(supabase, activeProject.id) : Promise.resolve([]),
    ])
    setResults(prices)
    setExpenses(exps)
    setSearched(true)
    setSearching(false)
  }

  const tiers = results ? tierFromResults(results) : null

  const aboveMarket = tiers
    ? expenses.filter(e => {
        if (!e.description.toLowerCase().includes(query.toLowerCase())) return false
        return e.amount > tiers.mid
      })
    : []

  const belowMarket = tiers
    ? expenses.filter(e => {
        if (!e.description.toLowerCase().includes(query.toLowerCase())) return false
        return e.amount < tiers.mid
      })
    : []

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold text-foreground mb-1">Price benchmark lookup</p>
        <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
          Compare your costs against regional market averages before ordering. Prices are benchmarks — not quotes. Labor excluded.
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLookup()}
              placeholder="e.g. cement, steel rebar, porcelain tile…"
              className="w-full rounded-lg border border-border bg-muted pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-card transition-colors"
            />
          </div>
          <button
            onClick={handleLookup}
            disabled={searching || !query.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-[11px] font-medium text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {searching ? 'Searching…' : 'Look up'}
          </button>
        </div>
      </div>

      {searched && (
        <>
          {!tiers ? (
            <div className="rounded-xl border border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">No price data found for "{query}".</p>
              <p className="text-xs text-muted-foreground mt-1">
                Seed the <code className="text-xs bg-muted px-1 rounded">price_intelligence</code> table in Supabase to populate benchmarks.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-sm font-semibold text-foreground mb-3">{query} — regional avg.</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="rounded-lg border border-border bg-muted/60 p-3">
                  <p className="text-[10px] text-muted-foreground mb-1">Budget</p>
                  <p className="font-mono text-base font-medium text-emerald-600">{fmt(tiers.budget, tiers.unit)}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Basic grade</p>
                </div>
                <div className="rounded-lg border border-[hsl(var(--brand-light))] bg-[hsl(var(--brand-soft))] p-3">
                  <p className="text-[10px] text-primary mb-1">Mid-range</p>
                  <p className="font-mono text-base font-medium text-primary">{fmt(tiers.mid, tiers.unit)}</p>
                  <p className="text-[10px] text-primary mt-1">Market average</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/60 p-3">
                  <p className="text-[10px] text-muted-foreground mb-1">Premium</p>
                  <p className="font-mono text-base font-medium text-muted-foreground">{fmt(tiers.premium, tiers.unit)}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">High spec</p>
                </div>
              </div>
              <div className="space-y-1">
                {tiers.results.map(r => (
                  <div key={r.id} className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{r.location}</span>
                    <span className="font-mono">{fmt(r.price, r.unit)}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
                ±20% variance expected. Does not include delivery, installation, or waste allowance.
              </p>
            </div>
          )}

          {aboveMarket.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <p className="text-sm font-semibold text-foreground mb-3">Your expenses above market</p>
              <div className="divide-y divide-border">
                {aboveMarket.map(e => (
                  <div key={e.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-[12.5px] text-foreground">{e.description}</p>
                      <p className="text-[10px] text-muted-foreground">{e.vendor}</p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
                      ${e.amount.toFixed(0)} logged
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {belowMarket.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-sm font-semibold text-foreground">Your expenses below market</p>
                <span className="text-[10px] text-emerald-600">Good deals ↓</span>
              </div>
              <div className="divide-y divide-border">
                {belowMarket.map(e => (
                  <div key={e.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-[12.5px] text-foreground">{e.description}</p>
                      <p className="text-[10px] text-muted-foreground">{e.vendor}</p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                      ${e.amount.toFixed(0)} logged
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function BudgetPage() {
  return (
    <div className="space-y-3">
      <Tabs defaultValue="budget-builder">
        <TabsList className="mb-1">
          <TabsTrigger value="budget-builder">Budget Builder</TabsTrigger>
          <TabsTrigger value="price-check">Price Check</TabsTrigger>
        </TabsList>
        <TabsContent value="budget-builder">
          <BudgetBuilder />
        </TabsContent>
        <TabsContent value="price-check">
          <PriceCheckContent />
        </TabsContent>
      </Tabs>
    </div>
  )
}
