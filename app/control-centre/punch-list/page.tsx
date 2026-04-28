"use client"

import { useEffect, useState } from "react"
import { useActiveProject } from "@/contexts/project-context"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import { getProjectTasks, ensurePunchListPhase } from "@/lib/project-queries"
import type { Task } from "@/lib/project-queries"
import { Skeleton } from "@/components/ui/skeleton"
import { Share2, Camera, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

type Status = 'todo' | 'in_progress' | 'done'
type FilterTab = 'all' | Status

const statusLabel: Record<Status, string> = { todo: 'Open', in_progress: 'In Progress', done: 'Done' }
const statusBadge: Record<Status, string> = {
  todo: "bg-amber-100 text-amber-700",
  in_progress: "bg-[hsl(var(--brand-soft))] text-primary",
  done: "bg-emerald-100 text-emerald-700",
}

export default function PunchListPage() {
  const { activeProject } = useActiveProject()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', category: '' })

  const loadTasks = async () => {
    if (!activeProject) return
    const supabase = createSupabaseBrowserClient()
    const data = await getProjectTasks(supabase, activeProject.id)
    setTasks(data)
    setLoading(false)
  }

  useEffect(() => { setLoading(true); loadTasks() }, [activeProject])

  const toggleTask = async (task: Task) => {
    const newStatus: Status = task.status === 'done' ? 'todo' : 'done'
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
    const supabase = createSupabaseBrowserClient()
    await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id)
  }

  const handleAddTask = async () => {
    if (!activeProject || !form.name.trim()) return
    setSubmitting(true)
    const supabase = createSupabaseBrowserClient()

    const phaseId = await ensurePunchListPhase(supabase, activeProject)
    if (!phaseId) { setSubmitting(false); return }

    await supabase.from('tasks').insert({
      phase_id: phaseId,
      name: form.name.trim(),
      description: form.category.trim() || null,
      due_date: activeProject.end_date ?? new Date().toISOString(),
      status: 'todo',
    })

    setForm({ name: '', category: '' })
    setDialogOpen(false)
    setSubmitting(false)
    await loadTasks()
  }

  const counts = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length,
  }

  const visible = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: `All (${counts.all})` },
    { key: 'todo', label: `Open (${counts.todo})` },
    { key: 'in_progress', label: `In Progress (${counts.in_progress})` },
    { key: 'done', label: `Done (${counts.done})` },
  ]

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
      {/* Tabs + actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1 flex-wrap flex-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${filter === tab.key ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors">
          <Share2 className="h-3 w-3" /> Share report
        </button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[11px] font-medium text-white hover:opacity-90 transition-opacity">
              <Plus className="h-3 w-3" /> Add item
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif">Add punch list item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Input placeholder="e.g. Patch drywall behind dishwasher" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Category <span className="text-muted-foreground">(optional)</span></Label>
                <Input placeholder="e.g. Drywall, Electrical, Paint" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
              </div>
              <button
                onClick={handleAddTask}
                disabled={submitting || !form.name.trim()}
                className="w-full rounded-full bg-primary py-2.5 text-sm font-medium text-white disabled:opacity-50 transition-opacity hover:opacity-90"
              >
                {submitting ? 'Adding…' : 'Add item'}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* List */}
      <div className="rounded-xl border border-border bg-card shadow-sm divide-y divide-border overflow-hidden">
        {visible.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {tasks.length === 0
                ? "No punch list items yet. Add your first item above."
                : "No items in this category."}
            </p>
          </div>
        ) : (
          visible.map(task => (
            <div key={task.id} className="flex items-start gap-3 px-4 py-3">
              <button
                onClick={() => toggleTask(task)}
                className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${task.status === 'done' ? 'border-emerald-500 bg-emerald-500' : 'border-muted-foreground/40 hover:border-primary'}`}
              >
                {task.status === 'done' && (
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-[12.5px] leading-snug ${task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {task.name}
                </p>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {task.description && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {task.description}
                    </span>
                  )}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge[task.status as Status]}`}>
                    {statusLabel[task.status as Status]}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
