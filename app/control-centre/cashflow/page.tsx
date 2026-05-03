"use client"

import { useEffect, useMemo, useState } from "react"
import { useActiveProject } from "@/contexts/project-context"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import {
  getProjectExpenses,
  getProjectPhasesDirectly,
  getSupplierSummary,
} from "@/lib/project-queries"
import type { Expense, Phase, SupplierSummary } from "@/lib/project-queries"
import { Skeleton } from "@/components/ui/skeleton"
import { ImportExpensesDialog } from "@/components/import-expenses-dialog"
import { AddExpenseDialog } from "@/components/add-expense-dialog"
import { Upload } from "lucide-react"

// ─── Formatting helpers ──────────────────────────────────────────────────────

const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', GBP: '£', EUR: '€', CAD: 'C$', AUD: 'A$' }

function useCurrencyPrefix() {
  const { activeProject } = useActiveProject()
  const code = activeProject?.currency?.toUpperCase() ?? 'USD'
  return CURRENCY_SYMBOLS[code] ?? '$'
}

function fmtAmt(n: number, prefix: string) {
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `${prefix}${(n / 1_000).toFixed(1)}K`
  return `${prefix}${n.toLocaleString()}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
}

function weekStart() {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return d
}

// ─── Category metadata ───────────────────────────────────────────────────────

const CAT_ICON: Record<string, string> = {
  Bricks: '🧱', Cement: '🏗️', Steel: '⚙️', Sand: '🏖️', Crush: '🪨',
  Labour: '👷', Plumbing: '🚿', Electrical: '🔌', Waterproofing: '🛡️',
  Materials: '📦', Miscellaneous: '🎊', Other: '📎',
}
const CAT_COLORS = [
  'hsl(var(--primary))', '#5588CC', '#7DBB8A', '#B8A98A', '#D4A847',
  '#A07EC0', '#6B8CCC', '#BB88CC', '#8BAA77', '#AAAAAA', '#CC8877', '#88AACC',
]

function catColor(cat: string, idx: number) {
  return CAT_COLORS[idx % CAT_COLORS.length]
}

// ─── Status helpers ──────────────────────────────────────────────────────────

function statusLabel(s: Phase['status']) {
  if (s === 'completed') return 'Complete'
  if (s === 'in_progress') return 'Active'
  return 'Upcoming'
}

function statusBadgeClass(s: Phase['status']) {
  if (s === 'completed') return 'bg-emerald-100 text-emerald-700'
  if (s === 'in_progress') return 'bg-[hsl(var(--brand-soft))] text-primary'
  return 'bg-muted text-muted-foreground'
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CashflowPage() {
  const { activeProject, refetch: refetchProject } = useActiveProject()
  const currencyPrefix = useCurrencyPrefix()

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [phases, setPhases] = useState<Phase[]>([])
  const [suppliers, setSuppliers] = useState<SupplierSummary[]>([])
  const [loading, setLoading] = useState(true)

  const [activeView, setActiveView] = useState<'expenses' | 'report'>('expenses')
  const [activePhaseId, setActivePhaseId] = useState<string>('__all__')
  const [activeSubTab, setActiveSubTab] = useState<'category' | 'transactions' | 'suppliers'>('category')
  const [pmNote, setPmNote] = useState('')

  const loadData = async () => {
    if (!activeProject) return
    const supabase = createSupabaseBrowserClient()
    const [exp, phs, sup] = await Promise.all([
      getProjectExpenses(supabase, activeProject.id),
      getProjectPhasesDirectly(supabase, activeProject.id),
      getSupplierSummary(supabase, activeProject.id),
    ])
    setExpenses(exp)
    setPhases(phs)
    setSuppliers(sup)
    setLoading(false)
  }

  useEffect(() => {
    setLoading(true)
    loadData()
  }, [activeProject])

  // ── Derived data ──────────────────────────────────────────────────────────

  const budget = activeProject?.budget ?? 0
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0)
  const donePhases = phases.filter(p => p.status === 'completed').length

  const thisMonthSpent = useMemo(() => {
    const now = new Date()
    return expenses
      .filter(e => {
        const d = new Date(e.date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      })
      .reduce((s, e) => s + e.amount, 0)
  }, [expenses])

  const phaseExpenses = useMemo(() => {
    if (activePhaseId === '__all__') return expenses
    return expenses.filter(e => e.phase_id === activePhaseId)
  }, [expenses, activePhaseId])

  const activePhase = phases.find(p => p.id === activePhaseId)

  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of phaseExpenses) {
      map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([cat, amt]) => ({ cat, amt }))
  }, [phaseExpenses])

  const maxCatAmt = byCategory[0]?.amt ?? 1

  const thisWeekExpenses = useMemo(() => {
    const since = weekStart()
    return expenses.filter(e => new Date(e.date) >= since)
  }, [expenses])

  const allByCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of expenses) map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => ({ cat, amt }))
  }, [expenses])

  const upcomingPhases = phases.filter(p => p.status === 'not_started').slice(0, 3)

  const previousVendors = useMemo(() =>
    Array.from(new Set(expenses.map(e => e.vendor).filter(Boolean) as string[])),
    [expenses]
  )

  // ── Phase actual vs budget ───────────────────────────────────────────────

  const phaseActual = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of expenses) {
      if (e.phase_id) map.set(e.phase_id, (map.get(e.phase_id) ?? 0) + e.amount)
    }
    return map
  }, [expenses])

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-4 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    )
  }

  if (!activeProject) return null

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-4">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex gap-0 rounded-lg border border-border p-1 bg-card">
          <button
            onClick={() => setActiveView('expenses')}
            className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-all ${
              activeView === 'expenses'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Phase Expenses
          </button>
          <button
            onClick={() => setActiveView('report')}
            className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-all ${
              activeView === 'report'
                ? 'bg-primary text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Stakeholder Report
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {activeProject && (
            <ImportExpensesDialog
              project={activeProject}
              onImported={loadData}
              trigger={
                <button className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted transition-colors">
                  <Upload className="h-3 w-3" /> Import CSV
                </button>
              }
            />
          )}
          <AddExpenseDialog
            project={activeProject}
            phases={phases}
            previousVendors={previousVendors}
            onSaved={async () => { await loadData(); await refetchProject() }}
            trigger={
              <button className="rounded-full bg-primary px-4 py-1.5 text-[11px] font-semibold text-white hover:opacity-90 transition-opacity">
                + Add expense
              </button>
            }
          />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          PHASE EXPENSES VIEW
      ══════════════════════════════════════════════════════════════════════ */}
      {activeView === 'expenses' && (
        <>
          {/* Summary strip */}
          <div className="grid grid-cols-4 gap-3">
            <SummaryCard label="Total budget" value={fmtAmt(budget, currencyPrefix)} />
            <SummaryCard label="Spent to date" value={fmtAmt(totalSpent, currencyPrefix)} valueClass="text-primary" sub={budget > 0 ? `${Math.round((totalSpent / budget) * 100)}% of budget` : undefined} subClass="text-amber-600" />
            <SummaryCard label="This month" value={fmtAmt(thisMonthSpent, currencyPrefix)} sub={new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} />
            <SummaryCard label="Phases done" value={`${donePhases} / ${phases.length}`} sub={phases.find(p => p.status === 'in_progress')?.name ? `${phases.find(p => p.status === 'in_progress')?.name} active` : undefined} subClass="text-emerald-600" />
          </div>

          {/* Phase tabs */}
          {phases.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
              <PhaseTab
                label="All phases"
                active={activePhaseId === '__all__'}
                done={false}
                onClick={() => { setActivePhaseId('__all__'); setActiveSubTab('category') }}
              />
              {phases.map((p, i) => (
                <PhaseTab
                  key={p.id}
                  label={`${i + 1} · ${p.name}`}
                  active={activePhaseId === p.id}
                  done={p.status === 'completed'}
                  onClick={() => { setActivePhaseId(p.id); setActiveSubTab('category') }}
                />
              ))}
            </div>
          )}

          {/* Phase header card — only when a specific phase is selected */}
          {activePhase && (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                <div>
                  <h2 className="font-serif text-xl font-semibold text-foreground">
                    {phases.findIndex(p => p.id === activePhase.id) + 1} — {activePhase.name}
                  </h2>
                  {(activePhase.start_date || activePhase.end_date) && (
                    <p className="font-mono text-[10px] text-muted-foreground mt-1">
                      {fmtDate(activePhase.start_date)} → {fmtDate(activePhase.end_date)}
                    </p>
                  )}
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusBadgeClass(activePhase.status)}`}>
                  {activePhase.status === 'completed' ? '✓ ' : activePhase.status === 'in_progress' ? '● ' : ''}{statusLabel(activePhase.status)}
                </span>
              </div>

              {/* Budget vs actual */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] text-muted-foreground mb-1">Budgeted</p>
                  <p className="font-mono text-sm font-medium text-foreground">{fmtAmt(activePhase.budget, currencyPrefix)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] text-muted-foreground mb-1">Actual spent</p>
                  <p className="font-mono text-sm font-medium text-foreground">{fmtAmt(phaseActual.get(activePhase.id) ?? 0, currencyPrefix)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-[10px] text-muted-foreground mb-1">Variance</p>
                  {(() => {
                    const actual = phaseActual.get(activePhase.id) ?? 0
                    const variance = activePhase.budget - actual
                    const isOver = variance < 0
                    return (
                      <p className={`font-mono text-sm font-medium ${isOver ? 'text-destructive' : 'text-emerald-600'}`}>
                        {isOver ? '↑ ' : '↓ '}{fmtAmt(Math.abs(variance), currencyPrefix)} {isOver ? 'over' : 'under'}
                      </p>
                    )
                  })()}
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${activePhase.status === 'completed' ? 'bg-emerald-500' : 'bg-primary'}`}
                  style={{ width: `${Math.min(activePhase.completion_percentage, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* All-phases header when showing everything */}
          {activePhaseId === '__all__' && expenses.length > 0 && (
            <div className="rounded-xl border border-border bg-card px-5 py-3 shadow-sm flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground font-serif">All phases</p>
              <p className="font-mono text-xs text-muted-foreground">{expenses.length} transactions · {fmtAmt(totalSpent, currencyPrefix)}</p>
            </div>
          )}

          {/* Sub-tabs */}
          <div className="flex gap-2">
            {(['category', 'transactions', 'suppliers'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`rounded-full px-4 py-1.5 text-[11px] font-semibold transition-all border ${
                  activeSubTab === tab
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-transparent text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                {tab === 'category' ? 'By category' : tab === 'transactions' ? 'All transactions' : 'By supplier'}
              </button>
            ))}
          </div>

          {/* ── By Category ──────────────────────────────────────────────── */}
          {activeSubTab === 'category' && (
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              {byCategory.length === 0 ? (
                <p className="text-xs text-muted-foreground p-4">No expenses in this phase yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {byCategory.map(({ cat, amt }, idx) => {
                    const txnCount = phaseExpenses.filter(e => e.category === cat).length
                    return (
                      <div key={cat} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 bg-muted/50">
                          {CAT_ICON[cat] ?? '📎'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-foreground">{cat}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{txnCount} transaction{txnCount !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden flex-shrink-0">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${(amt / maxCatAmt) * 100}%`, background: catColor(cat, idx) }}
                          />
                        </div>
                        <p className="font-mono text-[13px] font-medium text-foreground text-right min-w-[100px]">
                          {fmtAmt(amt, currencyPrefix)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── All Transactions ─────────────────────────────────────────── */}
          {activeSubTab === 'transactions' && (
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              {phaseExpenses.length === 0 ? (
                <p className="text-xs text-muted-foreground p-4">No transactions yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="px-4 py-2.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
                        <th className="px-4 py-2.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Supplier</th>
                        <th className="px-4 py-2.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Category</th>
                        <th className="px-4 py-2.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Qty</th>
                        <th className="px-4 py-2.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Rate</th>
                        <th className="px-4 py-2.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {phaseExpenses.map(exp => {
                        const catIdx = byCategory.findIndex(c => c.cat === exp.category)
                        return (
                          <tr key={exp.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                              {new Date(exp.date).toLocaleDateString('en-PK', { day: '2-digit', month: 'short' })}
                            </td>
                            <td className="px-4 py-3 max-w-[200px]">
                              <p className="text-[12px] font-medium text-foreground truncate">{exp.vendor || exp.description}</p>
                              {exp.notes && <p className="text-[10px] text-muted-foreground truncate mt-0.5">{exp.notes}</p>}
                              {exp.paid_by && exp.paid_by !== 'Self' && (
                                <p className="text-[10px] text-amber-600 mt-0.5">Paid by {exp.paid_by}</p>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: catColor(exp.category, catIdx < 0 ? 0 : catIdx) }} />
                                {exp.category}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-[11px] text-muted-foreground">
                              {exp.quantity != null ? `${exp.quantity.toLocaleString()}${exp.unit ? ' ' + exp.unit : ''}` : '—'}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-[11px] text-muted-foreground">
                              {exp.unit_rate != null ? `${currencyPrefix}${exp.unit_rate.toLocaleString()}` : '—'}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-[13px] font-medium text-foreground whitespace-nowrap">
                              ({fmtAmt(exp.amount, currencyPrefix)})
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── By Supplier ──────────────────────────────────────────────── */}
          {activeSubTab === 'suppliers' && (
            <div className="space-y-2">
              {suppliers.length === 0 ? (
                <p className="text-xs text-muted-foreground">No suppliers recorded yet.</p>
              ) : (
                suppliers
                  .filter(s => activePhaseId === '__all__' || s.phases.includes(activePhaseId))
                  .map(s => {
                    const initials = s.vendor.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('')
                    const trendPrices = s.unitPrices
                    const hasTrend = trendPrices.length >= 2
                    const firstRate = hasTrend ? trendPrices[0].rate : null
                    const lastRate = hasTrend ? trendPrices[trendPrices.length - 1].rate : null
                    const trendPct = hasTrend && firstRate ? ((lastRate! - firstRate) / firstRate * 100).toFixed(0) : null

                    return (
                      <div key={s.vendor} className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center gap-4 hover:border-primary/30 transition-colors">
                        <div className="h-10 w-10 rounded-xl bg-[hsl(var(--brand-soft))] flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-foreground">{s.vendor}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {s.categories.join(', ')} · {s.txnCount} transaction{s.txnCount !== 1 ? 's' : ''}
                          </p>
                          {hasTrend && trendPct !== null && (
                            <p className={`text-[10px] mt-0.5 ${parseFloat(trendPct) > 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                              {parseFloat(trendPct) > 0 ? '↑' : '↓'} {trendPrices[0].unit}: {currencyPrefix}{firstRate?.toLocaleString()} → {currencyPrefix}{lastRate?.toLocaleString()} ({parseFloat(trendPct) > 0 ? '+' : ''}{trendPct}%)
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-mono text-[15px] font-medium text-foreground">{fmtAmt(s.total, currencyPrefix)}</p>
                          <p className="text-[10px] text-muted-foreground">{s.phases.length > 1 ? 'Multiple phases' : 'This phase'}</p>
                        </div>
                      </div>
                    )
                  })
              )}
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          STAKEHOLDER REPORT VIEW
      ══════════════════════════════════════════════════════════════════════ */}
      {activeView === 'report' && (
        <div className="max-w-2xl space-y-4">

          {/* Report header — dark */}
          <div className="rounded-2xl bg-foreground p-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-primary/10 pointer-events-none" />
            <div className="absolute -bottom-6 -left-4 h-32 w-32 rounded-full bg-primary/5 pointer-events-none" />
            <p className="font-mono text-[9px] font-medium text-primary/70 uppercase tracking-widest mb-3 relative">
              Weekly project report · Week of {new Date().toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <h1 className="font-serif text-3xl font-bold text-background leading-tight mb-1 relative">
              {activeProject.name}
            </h1>
            {(activeProject.city || activeProject.country) && (
              <p className="text-sm text-background/50 mb-6 relative">
                {[activeProject.city, activeProject.country].filter(Boolean).join(', ')}
              </p>
            )}
            <div className="grid grid-cols-3 gap-3 relative">
              <div className="rounded-xl bg-background/8 border border-background/10 p-3">
                <p className="font-serif text-2xl font-bold text-background">{fmtAmt(totalSpent, currencyPrefix)}</p>
                <p className="text-[10px] text-background/50 mt-1">Spent of {fmtAmt(budget, currencyPrefix)}</p>
              </div>
              <div className="rounded-xl bg-background/8 border border-background/10 p-3">
                <p className="font-serif text-2xl font-bold text-background">
                  {budget > 0 ? `${Math.round((totalSpent / budget) * 100)}%` : '—'}
                </p>
                <p className="text-[10px] text-background/50 mt-1">Budget used</p>
              </div>
              <div className="rounded-xl bg-background/8 border border-background/10 p-3">
                <p className="font-serif text-2xl font-bold text-emerald-400">
                  {phases.find(p => p.status === 'in_progress') ? 'Active' : donePhases === phases.length && phases.length > 0 ? 'Done' : 'On track'}
                </p>
                <p className="text-[10px] text-background/50 mt-1">Status</p>
              </div>
            </div>
          </div>

          {/* Phase progress */}
          {phases.length > 0 && (
            <ReportCard title="Overall progress" badge={phases.find(p => p.status === 'in_progress')?.name ? `${phases.find(p => p.status === 'in_progress')?.name} active` : undefined}>
              <div className="space-y-3">
                {phases.map((p, i) => {
                  const actual = phaseActual.get(p.id) ?? 0
                  const pct = p.status === 'completed' ? 100 : p.status === 'in_progress' ? p.completion_percentage : 0
                  return (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-muted-foreground w-4 flex-shrink-0">{i + 1}</span>
                      <span className="text-[12px] text-foreground w-36 flex-shrink-0 truncate">{p.name}</span>
                      <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: p.status === 'completed'
                              ? 'hsl(var(--primary))'
                              : p.status === 'in_progress'
                                ? 'linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--brand-light)) 100%)'
                                : 'hsl(var(--muted-foreground) / 0.2)',
                          }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground w-12 text-right flex-shrink-0">
                        {p.status === 'completed' ? 'Done' : p.status === 'in_progress' ? `${Math.round(pct)}%` : '—'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </ReportCard>
          )}

          {/* This week's spending */}
          <ReportCard
            title="This week's spending"
            sub={`${new Date(weekStart().getTime()).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })} – ${new Date().toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}`}
            rightLabel={thisWeekExpenses.length > 0 ? fmtAmt(thisWeekExpenses.reduce((s, e) => s + e.amount, 0), currencyPrefix) : undefined}
          >
            {thisWeekExpenses.length === 0 ? (
              <p className="text-xs text-muted-foreground">No spending this week.</p>
            ) : (
              <div className="divide-y divide-border">
                {thisWeekExpenses.map(e => (
                  <div key={e.id} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center text-sm flex-shrink-0">
                        {CAT_ICON[e.category] ?? '📎'}
                      </div>
                      <div>
                        <p className="text-[12.5px] text-foreground">{e.vendor || e.description}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          {new Date(e.date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' })} · {e.category}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-[13px] font-medium text-foreground">({fmtAmt(e.amount, currencyPrefix)})</span>
                  </div>
                ))}
              </div>
            )}
          </ReportCard>

          {/* Where money goes */}
          <ReportCard title="Where the money has gone" sub={`Total ${fmtAmt(totalSpent, currencyPrefix)}`}>
            {allByCategory.length === 0 ? (
              <p className="text-xs text-muted-foreground">No expenses yet.</p>
            ) : (
              <div className="space-y-2.5">
                {allByCategory.map(({ cat, amt }, idx) => (
                  <div key={cat} className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-sm flex-shrink-0" style={{ background: catColor(cat, idx) }} />
                    <span className="text-[12px] text-foreground flex-1">{cat}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {totalSpent > 0 ? `${Math.round((amt / totalSpent) * 100)}%` : '0%'}
                    </span>
                    <span className="font-mono text-[12px] font-medium text-foreground min-w-[90px] text-right">
                      {fmtAmt(amt, currencyPrefix)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </ReportCard>

          {/* What's coming next */}
          {upcomingPhases.length > 0 && (
            <ReportCard title="What's coming next">
              <div className="space-y-2">
                {upcomingPhases.map(p => (
                  <div key={p.id} className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
                    <span className="font-mono text-[10px] font-medium text-primary w-16 flex-shrink-0">
                      {p.start_date ? new Date(p.start_date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric' }) : 'TBD'}
                    </span>
                    <span className="text-[12px] text-foreground">{p.name}</span>
                  </div>
                ))}
              </div>
            </ReportCard>
          )}

          {/* Note from project manager */}
          <ReportCard title="Note from project manager">
            <textarea
              value={pmNote}
              onChange={e => setPmNote(e.target.value)}
              rows={3}
              placeholder="Add context for your funder — explain big purchases, delays, or decisions before sending…"
              className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm font-serif italic text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground placeholder:not-italic"
            />
          </ReportCard>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-sm">
              Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SummaryCard({
  label, value, valueClass = 'text-foreground', sub, subClass = 'text-muted-foreground',
}: {
  label: string; value: string; valueClass?: string; sub?: string; subClass?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-[10px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wide">{label}</p>
      <p className={`font-serif text-2xl font-semibold leading-tight ${valueClass}`}>{value}</p>
      {sub && <p className={`text-[10px] mt-1 ${subClass}`}>{sub}</p>}
    </div>
  )
}

function PhaseTab({
  label, active, done, onClick,
}: {
  label: string; active: boolean; done: boolean; onClick: () => void
}) {
  const base = 'px-3.5 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap cursor-pointer border transition-all'
  if (active && done) return <button onClick={onClick} className={`${base} bg-emerald-600 text-white border-emerald-600 shadow-sm`}>{label}</button>
  if (active) return <button onClick={onClick} className={`${base} bg-primary text-white border-primary shadow-sm`}>{label}</button>
  if (done) return <button onClick={onClick} className={`${base} border-emerald-400 text-emerald-700 bg-emerald-50 hover:bg-emerald-100`}>{label}</button>
  return <button onClick={onClick} className={`${base} border-border text-muted-foreground bg-card hover:border-primary/40 hover:text-foreground`}>{label}</button>
}

function ReportCard({
  title, sub, badge, rightLabel, children,
}: {
  title: string; sub?: string; badge?: string; rightLabel?: string; children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h3 className="font-serif text-[14px] font-semibold text-foreground">{title}</h3>
          {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        {badge && (
          <span className="rounded-full bg-[hsl(var(--brand-soft))] text-primary text-[10px] font-semibold px-2.5 py-1">
            {badge}
          </span>
        )}
        {rightLabel && (
          <span className="font-mono text-[14px] font-semibold text-primary">{rightLabel}</span>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}
