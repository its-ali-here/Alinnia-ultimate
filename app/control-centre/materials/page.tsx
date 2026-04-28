"use client"

import { useEffect, useState } from "react"
import { useActiveProject } from "@/contexts/project-context"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import { getProjectExpenses, searchPriceIntelligence } from "@/lib/project-queries"
import type { Expense, PriceIntelligence } from "@/lib/project-queries"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle } from "lucide-react"

function fmt(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function getMarketBadge(expense: Expense, priceData: PriceIntelligence[]): { label: string; color: string } | null {
  if (priceData.length === 0) return null
  // Find a price entry whose item_name appears in the expense description
  const match = priceData.find(p =>
    expense.description.toLowerCase().includes(p.item_name.toLowerCase()) ||
    p.item_name.toLowerCase().includes(expense.description.toLowerCase().split(' ')[0])
  )
  if (!match) return null
  const diff = ((expense.amount - match.price) / match.price) * 100
  if (diff > 5) return { label: `+${Math.round(diff)}%`, color: 'bg-amber-100 text-amber-700' }
  if (diff < -5) return { label: `−${Math.round(Math.abs(diff))}%`, color: 'bg-emerald-100 text-emerald-700' }
  return { label: '~market', color: 'bg-muted text-muted-foreground' }
}

export default function MaterialsPage() {
  const { activeProject } = useActiveProject()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [priceData, setPriceData] = useState<PriceIntelligence[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!activeProject) { setLoading(false); return }
    const supabase = createSupabaseBrowserClient()
    Promise.all([
      getProjectExpenses(supabase, activeProject.id),
      // Load all price intelligence for the project's location
      searchPriceIntelligence(supabase, '', activeProject.city),
    ]).then(([exp, prices]) => {
      // Show only material-category expenses
      setExpenses(exp.filter(e => e.category === 'Materials'))
      setPriceData(prices)
      setLoading(false)
    })
  }, [activeProject])

  const filtered = expenses.filter(e =>
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    (e.vendor ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const aboveMarket = filtered.filter(e => {
    const b = getMarketBadge(e, priceData)
    return b && b.label.startsWith('+')
  })

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search materials…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:bg-card transition-colors"
        />
      </div>

      {aboveMarket.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-700">
          <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <span>{aboveMarket.length} item{aboveMarket.length > 1 ? 's' : ''} priced above regional market average.</span>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {expenses.length === 0
                ? 'No material expenses logged yet. Add expenses with category "Materials" in Cash Flow.'
                : 'No results for your search.'}
            </p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/60">
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Item</th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Total</th>
                <th className="px-3 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">vs. Market</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(e => {
                const badge = getMarketBadge(e, priceData)
                return (
                  <tr key={e.id} className="hover:bg-muted/40 transition-colors">
                    <td className="px-3 py-2.5">
                      <p className="text-foreground">{e.description}</p>
                      {e.vendor && <p className="text-[10px] text-muted-foreground mt-0.5">{e.vendor} · {new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-[11px] text-foreground">{fmt(e.amount)}</td>
                    <td className="px-3 py-2.5 text-right">
                      {badge ? (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.color}`}>{badge.label}</span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground">Market indicators use regional averages from Price Intelligence. Not a quote. ±20% variance expected.</p>
    </div>
  )
}
