"use client"

import { useEffect, useState } from "react"
import { useActiveProject } from "@/contexts/project-context"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import { getProjectExpenses, getProjectTasks } from "@/lib/project-queries"
import type { Expense, Task } from "@/lib/project-queries"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

function fmt(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

function daysUntil(dateStr: string | null) {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000)
  return diff
}

export default function OverviewPage() {
  const { activeProject, loading: projectLoading } = useActiveProject()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!activeProject) { setDataLoading(false); return }
    const supabase = createSupabaseBrowserClient()
    setDataLoading(true)
    Promise.all([
      getProjectExpenses(supabase, activeProject.id),
      getProjectTasks(supabase, activeProject.id),
    ]).then(([exp, tsk]) => {
      setExpenses(exp)
      setTasks(tsk)
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
          <p className="font-serif text-3xl font-semibold text-foreground leading-tight">{fmt(spent)}</p>
          <p className="text-[10px] text-amber-600 mt-1">of {fmt(budget)} total · {spentPct}%</p>
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
            {fmt(Math.max(0, budget - spent))} remaining
          </span>
        </div>
        <div className="flex h-2.5 overflow-hidden rounded-full bg-muted mb-2">
          <div className="bg-primary transition-all" style={{ width: `${Math.min(spentPct, 100)}%` }} />
        </div>
        <div className="flex gap-4 text-[10px] text-muted-foreground">
          <span><span className="text-primary">■</span> Spent {fmt(spent)}</span>
          <span>■ Available {fmt(Math.max(0, budget - spent))}</span>
          <span className="text-muted-foreground/60">Budget {fmt(budget)}</span>
        </div>
      </div>

      {/* Needs attention */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold text-foreground mb-3">Needs attention</p>
        {todoTasks.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            No open tasks.{' '}
            <Link href="/control-centre/punch-list" className="text-primary hover:underline">Add items to the punch list →</Link>
          </p>
        ) : (
          <div className="divide-y divide-border">
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
                  −{fmt(exp.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
