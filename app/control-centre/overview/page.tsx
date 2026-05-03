"use client"

import { useEffect, useState } from "react"
import { useActiveProject } from "@/contexts/project-context"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import { getProjectExpenses, getProjectTasks, getMaterialStock } from "@/lib/project-queries"
import type { Expense, Task, MaterialStock } from "@/lib/project-queries"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertTriangle, Truck } from "lucide-react"
import Link from "next/link"
import { IndustryInsights } from "@/components/industry-insights"

const MATERIAL_CATEGORIES = new Set([
  'Bricks', 'Cement', 'Steel', 'Sand', 'Crush',
  'Plumbing', 'Electrical', 'Waterproofing', 'Materials',
])

const CURRENCY_SYMBOLS: Record<string, string> = { USD: '$', GBP: '£', EUR: '€', CAD: 'C$', AUD: 'A$' }

function fmt(n: number, symbol: string) {
  if (n >= 1000000) return `${symbol}${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${symbol}${(n / 1000).toFixed(1)}K`
  return `${symbol}${n.toFixed(0)}`
}

function daysUntil(dateStr: string | null) {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
  return diff
}

export default function OverviewPage() {
  const { activeProject, loading: projectLoading } = useActiveProject()
  const currencySymbol = CURRENCY_SYMBOLS[(activeProject?.currency ?? 'USD').toUpperCase()] ?? '$'
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [materialStock, setMaterialStock] = useState<MaterialStock[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!activeProject) { setDataLoading(false); return }
    const supabase = createSupabaseBrowserClient()
    setDataLoading(true)
    Promise.all([
      getProjectExpenses(supabase, activeProject.id),
      getProjectTasks(supabase, activeProject.id),
      getMaterialStock(supabase, activeProject.id),
    ]).then(([exp, tsk, stk]) => {
      setExpenses(exp)
      setTasks(tsk)
      setMaterialStock(stk)
      setDataLoading(false)
    })
  }, [activeProject])

  const loading = projectLoading || dataLoading

  // Derived stats
  const budget = activeProject?.budget ?? 0
  const spent = expenses.reduce((s, e) => s + e.amount, 0)
  const spentPct = budget > 0 ? Math.round((spent / budget) * 100) : 0
  const daysLeft = daysUntil(activeProject?.end_date ?? null)
  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.status === 'done').length
  const todoTasks = tasks.filter(t => t.status === 'todo').slice(0, 3)
  const recentActivity = expenses.slice(0, 3)

  const today = new Date().toISOString().split('T')[0]
  const lowStockAlerts = materialStock.filter(
    s => s.reorder_threshold !== null && s.on_hand_qty < s.reorder_threshold
  )
  const overdueDeliveries = expenses.filter(
    e => MATERIAL_CATEGORIES.has(e.category)
      && e.delivery_status === 'ordered'
      && e.expected_delivery_date != null
      && e.expected_delivery_date <= today
  ).slice(0, 2)

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    )
  }

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground mb-4">You don't have a project yet.</p>
        <Link href="/auth/signup/wizard" className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white">
          Create your first project
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Budget used</p>
          <p className="font-serif text-3xl font-semibold text-foreground leading-tight">{fmt(spent, currencySymbol)}</p>
          <p className="text-[10px] text-amber-600 mt-1">of {fmt(budget, currencySymbol)} total · {spentPct}%</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Days remaining</p>
          <p className="font-serif text-3xl font-semibold text-foreground leading-tight">
            {daysLeft !== null ? (daysLeft > 0 ? daysLeft : 'Overdue') : '—'}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {activeProject.end_date
              ? `Target ${new Date(activeProject.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
              : 'No end date set'}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Tasks complete</p>
          <p className="font-serif text-3xl font-semibold text-foreground leading-tight">
            {totalTasks === 0 ? '—' : `${doneTasks}/${totalTasks}`}
          </p>
          <p className={`text-[10px] mt-1 ${totalTasks === 0 ? 'text-muted-foreground' : 'text-emerald-600'}`}>
            {totalTasks === 0 ? 'No tasks yet' : `${Math.round((doneTasks / totalTasks) * 100)}% complete`}
          </p>
        </div>
      </div>

      {/* Budget bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">Budget overview</p>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {fmt(Math.max(0, budget - spent), currencySymbol)} remaining
          </span>
        </div>
        <div className="flex h-2.5 overflow-hidden rounded-full bg-muted mb-2">
          <div className="bg-primary transition-all" style={{ width: `${Math.min(spentPct, 100)}%` }} />
        </div>
        <div className="flex gap-4 text-[10px] text-muted-foreground">
          <span><span className="text-primary">■</span> Spent {fmt(spent, currencySymbol)}</span>
          <span>■ Available {fmt(Math.max(0, budget - spent), currencySymbol)}</span>
          <span className="text-muted-foreground/60">Budget {fmt(budget, currencySymbol)}</span>
        </div>
      </div>

      {/* Needs attention */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold text-foreground mb-3">Needs attention</p>
        {lowStockAlerts.length === 0 && overdueDeliveries.length === 0 && todoTasks.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            Nothing needs attention right now.{' '}
            <Link href="/control-centre/punch-list" className="text-primary hover:underline">Add items to the punch list →</Link>
          </p>
        ) : (
          <div className="divide-y divide-border">

            {/* Low stock alerts */}
            {lowStockAlerts.map(s => (
              <div key={s.material_name} className="flex items-start gap-2.5 py-2.5">
                <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-2.5 w-2.5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] text-foreground">{s.material_name} is running low</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-destructive/10 text-destructive">Materials</span>
                    <span className="text-[10px] text-muted-foreground">
                      {s.on_hand_qty.toLocaleString()} {s.unit} on hand
                    </span>
                  </div>
                </div>
                <Link href="/control-centre/materials" className="text-[10px] text-primary hover:underline flex-shrink-0 mt-0.5">
                  Order →
                </Link>
              </div>
            ))}

            {/* Overdue deliveries */}
            {overdueDeliveries.map(e => (
              <div key={e.id} className="flex items-start gap-2.5 py-2.5">
                <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded bg-amber-100 flex items-center justify-center">
                  <Truck className="h-2.5 w-2.5 text-amber-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12.5px] text-foreground truncate">{e.description} — not arrived</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700">Materials</span>
                    {e.expected_delivery_date && (
                      <span className="text-[10px] text-muted-foreground">
                        Expected {new Date(e.expected_delivery_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
                <Link href="/control-centre/materials" className="text-[10px] text-primary hover:underline flex-shrink-0 mt-0.5">
                  Confirm →
                </Link>
              </div>
            ))}

            {/* Open tasks */}
            {todoTasks.map(task => {
              const due = task.due_date ? daysUntil(task.due_date) : null
              const isUrgent = due !== null && due <= 3
              return (
                <div key={task.id} className="flex items-start gap-2.5 py-2.5">
                  <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-[1.5px] border-muted-foreground/40" />
                  <div>
                    <p className="text-[12.5px] text-foreground">{task.name}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {due !== null && (
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${isUrgent ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'}`}>
                          {due === 0 ? 'Due today' : due < 0 ? `${Math.abs(due)}d overdue` : `${due}d left`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

          </div>
        )}
      </div>

      {/* Recent activity */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold text-foreground mb-3">Recent activity</p>
        {recentActivity.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            No expenses logged yet.{' '}
            <Link href="/control-centre/cashflow" className="text-primary hover:underline">Add your first expense →</Link>
          </p>
        ) : (
          <div className="divide-y divide-border">
            {recentActivity.map(exp => (
              <div key={exp.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-[12.5px] text-foreground">{exp.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {exp.vendor ? ` · ${exp.vendor}` : ''} · {exp.category}
                  </p>
                </div>
                <span className="font-mono text-[13px] font-medium text-foreground">
                  −{fmt(exp.amount, currencySymbol)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <IndustryInsights />
    </div>
  )
}
