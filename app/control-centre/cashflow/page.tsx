"use client"

import { useEffect, useState } from "react"
import { useActiveProject } from "@/contexts/project-context"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import { getProjectExpenses } from "@/lib/project-queries"
import type { Expense } from "@/lib/project-queries"
import { Skeleton } from "@/components/ui/skeleton"
import { ImportExpensesDialog } from "@/components/import-expenses-dialog"
import { Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

const CATEGORIES = ['Materials', 'Labor', 'Equipment', 'Permits & Fees', 'Professional Services', 'Other']

function fmt(n: number) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

export default function CashflowPage() {
  const { activeProject, refetch: refetchProject } = useActiveProject()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ description: '', amount: '', category: 'Materials', vendor: '', date: new Date().toISOString().split('T')[0] })

  const loadExpenses = async () => {
    if (!activeProject) return
    const supabase = createSupabaseBrowserClient()
    const data = await getProjectExpenses(supabase, activeProject.id)
    setExpenses(data)
    setLoading(false)
  }

  useEffect(() => { setLoading(true); loadExpenses() }, [activeProject])

  const handleAddExpense = async () => {
    if (!activeProject || !form.description || !form.amount) return
    setSubmitting(true)
    const supabase = createSupabaseBrowserClient()
    await supabase.from('expenses').insert({
      project_id: activeProject.id,
      description: form.description,
      amount: parseFloat(form.amount),
      category: form.category,
      vendor: form.vendor || null,
      date: form.date,
    })
    setForm({ description: '', amount: '', category: 'Materials', vendor: '', date: new Date().toISOString().split('T')[0] })
    setDialogOpen(false)
    setSubmitting(false)
    await loadExpenses()
    await refetchProject()
  }

  const budget = activeProject?.budget ?? 0
  const spent = expenses.reduce((s, e) => s + e.amount, 0)
  const available = Math.max(0, budget - spent)

  const byCategory = Object.entries(
    expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] ?? 0) + e.amount
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])

  const maxCat = byCategory[0]?.[1] ?? 1

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Total budget</p>
          <p className="font-serif text-3xl font-semibold text-foreground leading-tight">{fmt(budget)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Spent to date</p>
          <p className="font-serif text-3xl font-semibold text-primary leading-tight">{fmt(spent)}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Available</p>
          <p className="font-serif text-3xl font-semibold text-emerald-600 leading-tight">{fmt(available)}</p>
          <p className="text-[10px] text-muted-foreground mt-1">after logged spend</p>
        </div>
      </div>

      {/* Spend by category */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold text-foreground mb-4">Spend by category</p>
        {byCategory.length === 0 ? (
          <p className="text-xs text-muted-foreground">No expenses yet. Add one below.</p>
        ) : (
          <div className="space-y-3">
            {byCategory.map(([cat, amt]) => (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground">{cat}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{fmt(amt)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(amt / maxCat) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transactions */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">Transactions</p>
          <div className="flex items-center gap-2">
            {activeProject && (
              <ImportExpensesDialog
                project={activeProject}
                onImported={loadExpenses}
                trigger={
                  <button className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors">
                    <Upload className="h-3 w-3" /> Import CSV
                  </button>
                }
              />
            )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="rounded-md border border-border px-3 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors">
                + Add
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif">Log an expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <Input placeholder="e.g. Cement delivery" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Amount ($)</Label>
                    <Input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Date</Label>
                    <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Vendor <span className="text-muted-foreground">(optional)</span></Label>
                  <Input placeholder="e.g. Acme Supply" value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} />
                </div>
                <button
                  onClick={handleAddExpense}
                  disabled={submitting || !form.description || !form.amount}
                  className="w-full rounded-full bg-primary py-2.5 text-sm font-medium text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                >
                  {submitting ? 'Saving…' : 'Log expense'}
                </button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {expenses.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No expenses logged yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {expenses.slice(0, 20).map(exp => (
              <div key={exp.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-[12.5px] text-foreground">{exp.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {exp.vendor ? ` · ${exp.vendor}` : ''}
                  </p>
                </div>
                <span className="font-mono text-[13px] font-medium text-foreground">−{fmt(exp.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
