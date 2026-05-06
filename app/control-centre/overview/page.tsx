"use client"

import { useEffect, useState } from "react"
import { useActiveProject } from "@/contexts/project-context"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Analysis {
  achievable_pct: number
  fits_budget: string[]
  doesnt_fit_budget: string[]
}

interface Contractor {
  trade: string
  when?: string
}

// ─── Stage derivation ─────────────────────────────────────────────────────────

type Stage = { label: string; step: number }

function deriveStage(guidePurchased: boolean, status: string): Stage {
  if (status === "completed")                   return { label: "Done",          step: 4 }
  if (status === "in_progress")                 return { label: "Underway",       step: 3 }
  if (guidePurchased && status === "planning")  return { label: "Getting quotes", step: 2 }
  return                                               { label: "Planning",        step: 1 }
}

// ─── Default contractor slots by room type ────────────────────────────────────

const CONTRACTOR_DEFAULTS: Record<string, string[]> = {
  bathroom:      ["Plumber", "Tiler", "Electrician"],
  kitchen:       ["General contractor", "Electrician", "Plumber"],
  bedroom:       ["Painter / Decorator", "Carpenter", "Electrician"],
  "living-room": ["General contractor", "Electrician"],
  "full-home":   ["General contractor", "Electrician", "Plumber", "Decorator"],
  "multi-room":  ["General contractor", "Electrician", "Plumber", "Decorator"],
  extension:     ["General contractor", "Structural engineer", "Electrician", "Plumber"],
  outdoor:       ["Landscaper", "General contractor"],
}

// ─── Next steps by stage ──────────────────────────────────────────────────────

const NEXT_STEPS: Record<number, string[]> = {
  1: [
    "Get 3 quotes — your BOQ tells you exactly what to ask for",
    "Upload a quote to check if the price is fair",
    "Add your contractor's name and payment terms",
  ],
  2: [
    "Get 3 quotes — your BOQ tells you exactly what to ask for",
    "Upload a quote to check if the price is fair",
    "Add your contractor's name and payment terms",
  ],
  3: [
    "Log this week's invoice",
    "Check your budget remaining",
    "Upload your latest receipt",
  ],
  4: [
    "Complete the closeout checklist",
    "Download your project record",
  ],
}

// ─── Feasibility bar ──────────────────────────────────────────────────────────

function FeasibilityBar({ pct }: { pct: number }) {
  const color = pct >= 70 ? "#22c55e" : pct >= 45 ? "#f59e0b" : "#ef4444"
  return (
    <div className="h-2.5 w-full rounded-full bg-black/10 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  )
}

// ─── Stage progress bar ───────────────────────────────────────────────────────

function StageBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1 mt-2">
      {[1, 2, 3, 4].map((s) => (
        <div
          key={s}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors",
            s <= step ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const { activeProject, loading: projectLoading } = useActiveProject()
  const supabase = createSupabaseBrowserClient()

  const [analysis, setAnalysis]       = useState<Analysis | null>(null)
  const [contractors, setContractors] = useState<string[]>([])
  const [totalSpent, setTotalSpent]   = useState(0)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!activeProject) { setDataLoading(false); return }

    const load = async () => {
      setDataLoading(true)

      // Latest analysis
      const { data: an } = await supabase
        .from("renovation_analyses")
        .select("achievable_pct, fits_budget, doesnt_fit_budget")
        .eq("project_id", activeProject.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (an) setAnalysis(an as Analysis)

      // Guide contractors if purchased
      const { data: guide } = await supabase
        .from("renovation_guides")
        .select("contractors_needed")
        .eq("project_id", activeProject.id)
        .maybeSingle()

      if (guide?.contractors_needed && Array.isArray(guide.contractors_needed)) {
        setContractors(
          (guide.contractors_needed as Contractor[]).map((c) =>
            typeof c === "string" ? c : c.trade
          )
        )
      } else {
        setContractors(
          CONTRACTOR_DEFAULTS[activeProject.room_type ?? ""] ?? ["General contractor", "Electrician"]
        )
      }

      // Total spent
      const { data: expenses } = await supabase
        .from("expenses")
        .select("amount")
        .eq("project_id", activeProject.id)

      if (expenses) {
        setTotalSpent(
          expenses.reduce((s: number, e: { amount: number }) => s + (e.amount ?? 0), 0)
        )
      }

      setDataLoading(false)
    }

    load()
  }, [activeProject?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Loading skeleton ────────────────────────────────────────────────────────

  if (projectLoading || dataLoading) {
    return (
      <div className="space-y-4 max-w-2xl animate-pulse">
        <div className="h-8 w-56 bg-muted rounded-lg" />
        <div className="h-40 bg-muted rounded-[16px]" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-28 bg-muted rounded-[16px]" />
          <div className="h-28 bg-muted rounded-[16px]" />
        </div>
        <div className="h-36 bg-muted rounded-[16px]" />
        <div className="h-32 bg-muted rounded-[16px]" />
      </div>
    )
  }

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
        <p className="text-[15px] font-semibold text-foreground">No project yet</p>
        <p className="text-[13px] text-muted-foreground">
          Complete the analysis wizard to get started.
        </p>
      </div>
    )
  }

  const budget    = Number(activeProject.budget)
  const remaining = budget - totalSpent
  const location  = activeProject.zip_code ?? ""
  const city      = location.split(",")[0] ?? location
  const stage     = deriveStage(activeProject.guide_purchased, activeProject.status ?? "planning")
  const roomLabel = (activeProject.room_type ?? "renovation").replace(/-/g, " ")

  return (
    <div className="space-y-4 max-w-2xl">

      {/* ── Project header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-[26px] font-semibold text-foreground leading-tight">
            {activeProject.name}
          </h1>
          {location && (
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {location} · £{budget.toLocaleString()} budget
            </p>
          )}
        </div>
        <span className="flex-shrink-0 mt-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[hsl(var(--brand-soft))] text-primary">
          {stage.label}
        </span>
      </div>

      {/* ── Feasibility card ── */}
      {analysis ? (
        <div className="rounded-[16px] bg-[hsl(var(--brand-soft))] border border-primary/15 p-5 space-y-3">
          <div>
            <p className="text-[14px] font-medium text-foreground">
              With £{budget.toLocaleString()} in {city} you can achieve
            </p>
            <p className="text-[22px] font-bold text-primary mt-0.5">
              {Math.round(analysis.achievable_pct)}% of your inspiration look
            </p>
          </div>
          <FeasibilityBar pct={analysis.achievable_pct} />
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 pt-1">
            {analysis.fits_budget.map((item, i) => (
              <p key={i} className="flex items-start gap-1.5 text-[12px] text-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 mt-1.5" />
                {item}
              </p>
            ))}
            {analysis.doesnt_fit_budget.map((item, i) => (
              <p key={i} className="flex items-start gap-1.5 text-[12px] text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-1.5" />
                {item}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-[16px] bg-muted p-5 text-center text-[13px] text-muted-foreground">
          Analysis not available yet.
        </div>
      )}

      {/* ── Budget remaining + Project stage ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-[16px] border border-border bg-card p-4">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Budget remaining
          </p>
          <p className="text-[26px] font-bold text-foreground font-mono leading-none">
            £{remaining.toLocaleString()}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            £{totalSpent.toLocaleString()} committed so far
          </p>
        </div>
        <div className="rounded-[16px] border border-border bg-card p-4">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            Project stage
          </p>
          <p className="text-[18px] font-semibold text-foreground">{stage.label}</p>
          <p className="text-[11px] text-muted-foreground">Step {stage.step} of 4</p>
          <StageBar step={stage.step} />
        </div>
      </div>

      {/* ── YOUR TEAM ── */}
      <div className="rounded-[16px] border border-border bg-card p-4 space-y-3">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
          Your team — pre-set for a {roomLabel}
        </p>
        <ul className="divide-y divide-border/50">
          {contractors.map((trade, i) => (
            <li key={i} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/25 flex-shrink-0" />
                <span className="text-[13px] text-foreground">{trade}</span>
              </div>
              <button type="button" className="text-[11.5px] text-primary font-medium hover:underline">
                + Add details
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* ── DO THESE NEXT ── */}
      <div className="rounded-[16px] border border-border bg-card p-4 space-y-3">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
          Do these next
        </p>
        <ul className="space-y-2.5">
          {(NEXT_STEPS[stage.step] ?? NEXT_STEPS[1]).map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded border border-border flex-shrink-0 mt-0.5" />
              <span className="text-[13px] text-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  )
}
