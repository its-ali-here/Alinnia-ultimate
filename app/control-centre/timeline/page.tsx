"use client"

import { Fragment, useEffect, useState } from "react"
import { useActiveProject } from "@/contexts/project-context"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import { getProjectPhases, getMaterialStock } from "@/lib/project-queries"
import type { ProjectPhaseWithTemplate, MaterialStock } from "@/lib/project-queries"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, AlertTriangle, Check, CheckCircle2, Package } from "lucide-react"
import Link from "next/link"

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

function getPhaseStatus(
  phase: ProjectPhaseWithTemplate,
  index: number,
  all: ProjectPhaseWithTemplate[]
): "complete" | "in_progress" | "upcoming" {
  if (phase.is_completed) return "complete"
  const prevComplete = all.slice(0, index).every(p => p.is_completed)
  if (prevComplete && phase.is_selected) return "in_progress"
  return "upcoming"
}

function lineStyle(status: string, nextStatus: string | null): React.CSSProperties {
  if (status === "complete" && nextStatus === "complete")
    return { background: "rgb(34 197 94)" }
  if (status === "complete" && nextStatus === "in_progress")
    return { background: "linear-gradient(180deg, rgb(34 197 94) 0%, hsl(var(--primary)) 100%)" }
  if (status === "in_progress")
    return { background: "linear-gradient(180deg, hsl(var(--primary)) 0%, rgb(203 213 225 / 0.35) 100%)" }
  return { background: "rgb(203 213 225 / 0.3)" }
}

export default function TimelinePage() {
  const { activeProject, loading: projectLoading } = useActiveProject()
  const [phases, setPhases] = useState<ProjectPhaseWithTemplate[]>([])
  const [materialStock, setMaterialStock] = useState<MaterialStock[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeProject) { setLoading(false); return }
    const supabase = createSupabaseBrowserClient()
    Promise.all([
      getProjectPhases(supabase, activeProject.id),
      getMaterialStock(supabase, activeProject.id),
    ]).then(([data, stk]) => {
      setPhases(data)
      setMaterialStock(stk)
      setLoading(false)
    })
  }, [activeProject])

  const lowStockItems = materialStock.filter(
    s => s.reorder_threshold !== null && s.on_hand_qty < s.reorder_threshold
  )

  const isOverdue = activeProject?.end_date
    ? new Date(activeProject.end_date) < new Date()
    : false

  if (projectLoading || loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-end justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-2.5 w-24 rounded" />
            <Skeleton className="h-6 w-36 rounded" />
          </div>
          <Skeleton className="h-3.5 w-44 rounded" />
        </div>
        <div>
          {[1, 2, 3].map(i => (
            <div key={i} className="flex">
              <div className="flex flex-col items-center w-12 flex-shrink-0">
                <Skeleton className="w-[22px] h-[22px] rounded-full flex-shrink-0" />
                {i < 3 && <div className="w-0.5 flex-1 bg-border/50 mt-1.5 min-h-[64px]" />}
              </div>
              <div className="flex-1 pl-1 pb-8">
                <Skeleton className="h-5 w-40 rounded mb-2" />
                <Skeleton className="h-3.5 w-full rounded mb-1.5" />
                <Skeleton className="h-3.5 w-3/4 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!activeProject) return null

  const selected = phases.filter(p => p.is_selected)
  const firstUpcomingIndex = selected.findIndex((p, i) => getPhaseStatus(p, i, selected) === "upcoming")
  const todayMarkerIndex = selected.findIndex((p, i) => getPhaseStatus(p, i, selected) !== "complete")

  const todayLabel = new Date().toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric"
  })

  return (
    <div className="space-y-5">

      {/* Page header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] font-mono font-medium uppercase tracking-widest text-primary mb-1.5">
            Project timeline
          </p>
          <h1 className="font-serif text-[22px] font-bold text-foreground leading-tight">
            Build sequence
          </h1>
        </div>
        <div className="flex items-center gap-5 pb-0.5">
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 block flex-shrink-0" />
            Done
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-primary">
            <span className="w-2 h-2 rounded-full bg-primary block flex-shrink-0" />
            Active
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
            <span className="w-2 h-2 rounded-full border-2 border-muted-foreground/40 block flex-shrink-0" />
            Upcoming
          </span>
        </div>
      </div>

      {/* Status banner */}
      {isOverdue ? (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <span>Project end date has passed. Update your timeline or mark remaining phases complete.</span>
        </div>
      ) : activeProject.end_date ? (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <span>Project on schedule. End date: {fmt(activeProject.end_date)}.</span>
        </div>
      ) : null}

      {/* Empty state */}
      {selected.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">No phases were selected during project setup.</p>
          <p className="text-xs text-muted-foreground mt-1">Phases appear here once you select them in the wizard.</p>
        </div>
      ) : (
        <div>
          {selected.map((phase, i) => {
            const status = getPhaseStatus(phase, i, selected)
            const nextStatus = i < selected.length - 1
              ? getPhaseStatus(selected[i + 1], i + 1, selected)
              : null
            const isLast = i === selected.length - 1
            const isNextUpcoming = i === firstUpcomingIndex

            const showLowStockWarning =
              lowStockItems.length > 0 &&
              (status === "in_progress" || (status === "upcoming" && isNextUpcoming))
            const showStockOk =
              !showLowStockWarning && status === "in_progress" && materialStock.length > 0

            return (
              <Fragment key={phase.id}>
                {/* Today marker — injected before the first non-complete phase */}
                {i === todayMarkerIndex && todayMarkerIndex > 0 && (
                  <div className="flex items-center pl-12 pb-5 -mt-2">
                    <div className="flex-1 flex items-center gap-2 pl-1">
                      <div className="flex-1 h-px bg-primary/25" />
                      <span className="font-mono text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full whitespace-nowrap">
                        ● Today — {todayLabel}
                      </span>
                      <div className="flex-1 h-px bg-primary/25" />
                    </div>
                  </div>
                )}

                <div className="flex">
                  {/* ── Spine ── */}
                  <div className="flex flex-col items-center w-12 flex-shrink-0">
                    {/* Dot */}
                    <div className="flex-shrink-0 mt-0.5">
                      {status === "complete" ? (
                        <div className="w-[22px] h-[22px] rounded-full bg-emerald-500 flex items-center justify-center shadow-sm"
                          style={{ boxShadow: "0 0 0 4px rgba(34,197,94,0.12)" }}>
                          <Check className="w-3 h-3 text-white stroke-[2.5]" />
                        </div>
                      ) : status === "in_progress" ? (
                        <div className="relative">
                          <div
                            className="absolute rounded-full bg-primary/20 animate-ping"
                            style={{ inset: "-5px", animationDuration: "2s" }}
                          />
                          <div
                            className="relative w-[22px] h-[22px] rounded-full bg-primary flex items-center justify-center shadow-sm"
                            style={{ boxShadow: "0 0 0 4px rgba(var(--primary-rgb, 196 98 45) / 0.18)" }}
                          >
                            <div className="w-2.5 h-2.5 rounded-full bg-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-[22px] h-[22px] rounded-full bg-background border-2 border-muted-foreground/25" />
                      )}
                    </div>

                    {/* Connecting line */}
                    {!isLast && (
                      <div
                        className="w-0.5 flex-1 mt-1.5 min-h-[20px]"
                        style={lineStyle(status, nextStatus)}
                      />
                    )}
                  </div>

                  {/* ── Content ── */}
                  <div className={`flex-1 pl-3 ${isLast ? "pb-2" : "pb-9"}`}>
                    {/* Phase name + badge */}
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <h2
                        className={`font-serif text-[16px] font-bold leading-snug ${
                          status === "complete" ? "text-foreground/70" : "text-foreground"
                        }`}
                      >
                        {phase.phase_templates.name}
                      </h2>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-mono font-semibold flex-shrink-0 mt-1 ${
                          status === "complete"
                            ? "bg-emerald-100 text-emerald-700"
                            : status === "in_progress"
                            ? "bg-[hsl(var(--brand-soft))] text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {status === "complete" ? "Complete" : status === "in_progress" ? "In progress" : "Upcoming"}
                      </span>
                    </div>

                    {/* Description */}
                    {phase.phase_templates.description && (
                      <p className="text-[11px] text-muted-foreground leading-relaxed mb-2.5">
                        {phase.phase_templates.description}
                      </p>
                    )}

                    {/* Low stock warning */}
                    {showLowStockWarning && (
                      <Link
                        href="/control-centre/materials"
                        className={`flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-[11px] border hover:opacity-90 transition-opacity ${
                          status === "in_progress"
                            ? "bg-red-50 border-red-200/70 text-red-900"
                            : "bg-amber-50 border-amber-200/70 text-amber-900"
                        }`}
                      >
                        {status === "in_progress"
                          ? <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                          : <Package className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                        }
                        <span className="flex-1 leading-relaxed">
                          <strong className="font-semibold">
                            {status === "in_progress" ? "Stock running low. " : "Order materials soon. "}
                          </strong>
                          {status === "in_progress"
                            ? `${lowStockItems.map(s => s.material_name).join(", ")} ${lowStockItems.length === 1 ? "is" : "are"} running low — reorder before work stalls.`
                            : `${lowStockItems.length} item${lowStockItems.length !== 1 ? "s" : ""} below threshold — check stock before this phase starts.`
                          }
                        </span>
                        <span className="font-semibold text-primary flex-shrink-0 mt-0.5 whitespace-nowrap">
                          Order now →
                        </span>
                      </Link>
                    )}

                    {/* All stocked */}
                    {showStockOk && (
                      <Link
                        href="/control-centre/materials"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200/60 hover:opacity-90 transition-opacity"
                      >
                        <Package className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>All tracked materials are stocked</span>
                      </Link>
                    )}
                  </div>
                </div>
              </Fragment>
            )
          })}
        </div>
      )}
    </div>
  )
}
