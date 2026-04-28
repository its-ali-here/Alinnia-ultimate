"use client"

import { useEffect, useState } from "react"
import { useActiveProject } from "@/contexts/project-context"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import { getProjectPhases } from "@/lib/project-queries"
import type { ProjectPhaseWithTemplate } from "@/lib/project-queries"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle2, AlertCircle } from "lucide-react"

const statusBadge: Record<string, string> = {
  complete: "bg-emerald-100 text-emerald-700",
  in_progress: "bg-[hsl(var(--brand-soft))] text-primary",
  upcoming: "bg-muted text-muted-foreground",
}

export default function TimelinePage() {
  const { activeProject, loading: projectLoading } = useActiveProject()
  const [phases, setPhases] = useState<ProjectPhaseWithTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeProject) { setLoading(false); return }
    const supabase = createSupabaseBrowserClient()
    getProjectPhases(supabase, activeProject.id).then(data => {
      setPhases(data)
      setLoading(false)
    })
  }, [activeProject])

  const isOverdue = activeProject?.end_date
    ? new Date(activeProject.end_date) < new Date()
    : false

  const getPhaseStatus = (phase: ProjectPhaseWithTemplate, index: number, all: ProjectPhaseWithTemplate[]) => {
    if (phase.is_completed) return 'complete'
    const prevComplete = all.slice(0, index).every(p => p.is_completed)
    if (prevComplete && phase.is_selected) return 'in_progress'
    return 'upcoming'
  }

  if (projectLoading || loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 rounded-lg" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
      </div>
    )
  }

  if (!activeProject) return null

  const selected = phases.filter(p => p.is_selected)

  return (
    <div className="space-y-3">
      {/* Status alert */}
      {isOverdue ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <span>Project end date has passed. Update your timeline or mark remaining phases complete.</span>
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <span>
            {activeProject.end_date
              ? `Project is on schedule. End date: ${new Date(activeProject.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`
              : 'Project timeline active.'}
          </span>
        </div>
      )}

      {selected.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">No phases were selected during project setup.</p>
          <p className="text-xs text-muted-foreground mt-1">Phases appear here once you select them in the wizard.</p>
        </div>
      ) : (
        selected.map((phase, i) => {
          const status = getPhaseStatus(phase, i, selected)
          const dotColor = status === 'complete' ? 'bg-emerald-500' : status === 'in_progress' ? 'bg-primary' : 'bg-muted-foreground/30'
          const label = status === 'complete' ? 'Complete' : status === 'in_progress' ? 'In progress' : 'Upcoming'

          return (
            <div key={phase.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-border">
                <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${dotColor}`} />
                <span className="text-[13px] font-semibold text-foreground flex-1">
                  Phase {phase.phase_templates.order_index} — {phase.phase_templates.name}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusBadge[status]}`}>
                  {label}
                </span>
              </div>
              {phase.phase_templates.description && (
                <p className="text-xs text-muted-foreground mb-3">{phase.phase_templates.description}</p>
              )}
              <p className="text-[11px] text-muted-foreground italic">
                Tasks added via Punch List will appear here in a future update.
              </p>
            </div>
          )
        })
      )}
    </div>
  )
}
