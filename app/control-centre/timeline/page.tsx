"use client"

import { CheckCircle2, Circle } from "lucide-react"

const phases = [
  {
    name: "Phase 1 — Demolition",
    status: "Complete",
    statusColor: "green",
    dotColor: "bg-emerald-500",
    milestones: [
      { label: "Demo existing cabinets & fixtures", date: "Jul 1", done: true },
      { label: "Remove tile flooring", date: "Jul 2", done: true },
      { label: "Expose rough-in plumbing", date: "Jul 3", done: true },
    ],
  },
  {
    name: "Phase 2 — Rough-in & Structure",
    status: "In progress",
    statusColor: "orange",
    dotColor: "bg-primary",
    milestones: [
      { label: "Electrical rough-in", date: "Jul 20", done: true },
      { label: "Plumbing rough-in", date: "Jul 25", done: false, active: true },
      { label: "Drywall hanging", date: "Aug 1", done: false },
      { label: "Electrical inspection (permit #2042)", date: "Aug 2", done: false },
    ],
  },
  {
    name: "Phase 3 — Finishes",
    status: "Upcoming",
    statusColor: "neutral",
    dotColor: "bg-muted-foreground/30",
    milestones: [
      { label: "Tile installation", date: "Aug 8", done: false },
      { label: "Cabinet install — KBF Designs", date: "Aug 12", done: false },
      { label: "Countertop template & measure", date: "Aug 18", done: false },
      { label: "Appliance install", date: "Aug 25", done: false },
      { label: "Final walkthrough & punch sign-off", date: "Sep 2", done: false },
    ],
  },
]

const statusBadge: Record<string, string> = {
  green: "bg-emerald-100 text-emerald-700",
  orange: "bg-[hsl(var(--brand-soft))] text-primary",
  neutral: "bg-muted text-muted-foreground",
}

export default function TimelinePage() {
  return (
    <div className="space-y-3">
      {/* Status alert */}
      <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
        <span>Project is on schedule. Plumbing rough-in due Jul 25 — 3 days away.</span>
      </div>

      {phases.map((phase) => (
        <div key={phase.name} className="rounded-xl border border-border bg-card p-4 shadow-sm">
          {/* Phase header */}
          <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-border">
            <div className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${phase.dotColor}`} />
            <span className="text-[13px] font-semibold text-foreground flex-1">{phase.name}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusBadge[phase.statusColor]}`}>
              {phase.status}
            </span>
          </div>

          {/* Milestones */}
          <div className="space-y-0 divide-y divide-dashed divide-border/60">
            {phase.milestones.map((m) => (
              <div key={m.label} className="flex items-center gap-2.5 py-1.5">
                <div className={`h-2.5 w-2.5 rounded-[3px] flex-shrink-0 ${
                  m.done ? "bg-emerald-500" : "active" in m && m.active ? "bg-primary" : "border border-muted-foreground/30"
                }`} />
                <span className={`flex-1 text-xs ${m.done ? "text-muted-foreground line-through" : "text-foreground"} ${"active" in m && m.active ? "font-medium" : ""}`}>
                  {m.label}
                </span>
                <span className={`font-mono text-[11px] ${"active" in m && m.active ? "text-primary font-medium" : "text-muted-foreground"}`}>
                  {m.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
