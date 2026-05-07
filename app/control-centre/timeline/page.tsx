"use client"

import { useEffect, useState } from "react"
import { useActiveProject } from "@/contexts/project-context"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkStep {
  step: number
  title: string
  description: string
  why: string
}

// ─── Default stages by room type ─────────────────────────────────────────────

const DEFAULT_STAGES: Record<string, { title: string; description: string }[]> = {
  bathroom: [
    { title: "Plan & design",         description: "Confirm layout, choose fixtures, get quotes from plumber and tiler" },
    { title: "Demolition & strip-out",description: "Remove old suite, tiles, and screed — expose the shell" },
    { title: "Waterproofing & plumbing", description: "Tanking membrane, first-fix plumbing, waste positions set" },
    { title: "Tiling & screeding",    description: "Wall and floor tiles laid, floor screed poured" },
    { title: "Fit-out",               description: "Suite, shower, mirrors, heated towel rail, and accessories installed" },
    { title: "Snagging & sign-off",   description: "Check everything works, fix minor defects, final clean" },
  ],
  kitchen: [
    { title: "Plan & design",         description: "Finalise layout, select units and appliances, get contractor quotes" },
    { title: "Demolition & strip-out",description: "Remove old kitchen, expose plumbing and electrical routes" },
    { title: "Plumbing & electrical rough-in", description: "First-fix trades before boarding — pipes, cables, extraction" },
    { title: "Units & worktops",      description: "Fit carcasses, hang doors, install worktops and splashback" },
    { title: "Appliances & finishing",description: "Connect appliances, fit lighting, paint, final hardware" },
    { title: "Snagging & sign-off",   description: "Check all appliances, fix gaps, final clean" },
  ],
  bedroom: [
    { title: "Plan & design",         description: "Confirm layout, storage plan, flooring and finish choices" },
    { title: "Preparation",           description: "Strip existing finishes, electrical rough-in if needed" },
    { title: "Boarding & plastering", description: "Drywall, sound insulation, skim plaster" },
    { title: "Flooring",              description: "Lay flooring, fit skirting boards" },
    { title: "Decoration & joinery",  description: "Paint, fitted furniture, wardrobes, lighting" },
    { title: "Snagging & sign-off",   description: "Punch list, touch-ups, final clean" },
  ],
  "living-room": [
    { title: "Plan & design",         description: "Confirm scope — flooring, walls, fireplace, storage" },
    { title: "Preparation",           description: "Strip out, any structural work, electrical rough-in" },
    { title: "Flooring",              description: "Subfloor prep and floor finish laid" },
    { title: "Walls & decoration",    description: "Plaster, paint, feature wall or panelling" },
    { title: "Joinery & finishing",   description: "Built-ins, lighting, skirting, architrave" },
    { title: "Snagging & sign-off",   description: "Punch list, touch-ups, final clean" },
  ],
  "full-home": [
    { title: "Plan & surveys",        description: "Full design package, structural survey, permissions" },
    { title: "Demolition",            description: "Phased strip-out room by room" },
    { title: "Structural work",       description: "Beams, load-bearing changes, underpinning if needed" },
    { title: "MEP rough-in",          description: "Plumbing, electrical, and mechanical first fix throughout" },
    { title: "Boarding & plastering", description: "Drywall, insulation, skimming across all rooms" },
    { title: "Fit-out & joinery",     description: "Kitchen, bathrooms, joinery, staircase" },
    { title: "Decoration & flooring", description: "Paint, floor finishes, tiles, fixtures throughout" },
    { title: "Snagging & sign-off",   description: "Full punch list, final inspections, handover" },
  ],
  extension: [
    { title: "Planning permission",   description: "Submit drawings, await approval — typically 8 weeks" },
    { title: "Groundworks",           description: "Excavation, drainage, and foundation poured" },
    { title: "Structure",             description: "Walls, roof structure, windows to watertight stage" },
    { title: "MEP rough-in",          description: "Services integrated with existing structure" },
    { title: "Fit-out & finishing",   description: "Insulation, drywall, joinery, decoration" },
    { title: "Integration & sign-off",description: "Open up to main house, snagging, building regs sign-off" },
  ],
  outdoor: [
    { title: "Plan & design",         description: "Layout, materials, landscaping brief, contractor quotes" },
    { title: "Groundworks",           description: "Excavation, drainage, base preparation" },
    { title: "Hard landscaping",      description: "Paving, decking, retaining walls, fencing" },
    { title: "Services",              description: "Outdoor electrics, irrigation, lighting" },
    { title: "Soft landscaping",      description: "Planting, lawn, soil preparation" },
    { title: "Finishing & sign-off",  description: "Final touches, clean-up, handover" },
  ],
  "multi-room": [
    { title: "Plan & phasing",        description: "Sequence rooms to keep the home liveable during works" },
    { title: "Demolition by area",    description: "Phased strip-out room by room" },
    { title: "Structural & MEP",      description: "Structural changes and first-fix trades" },
    { title: "Wet areas",             description: "Waterproofing, tiling, and screeding in bathrooms" },
    { title: "Fit-out & joinery",     description: "Kitchen, bedrooms, living spaces fitted out" },
    { title: "Decoration & flooring", description: "Paint, floor finishes, fixtures throughout" },
    { title: "Snagging & sign-off",   description: "Full punch list, final clean, handover" },
  ],
}

const FALLBACK_STAGES = DEFAULT_STAGES.bathroom

// ─── Stage status ─────────────────────────────────────────────────────────────

type StepState = "done" | "active" | "upcoming"

function getStepState(idx: number, currentStep: number, total: number): StepState {
  if (idx < currentStep) return "done"
  if (idx === currentStep) return "active"
  return "upcoming"
}

// ─── Current step derivation ──────────────────────────────────────────────────

function deriveCurrentStep(
  guidePurchased: boolean,
  status: string,
  totalSteps: number,
  totalExpenses: number
): number {
  if (status === "completed") return totalSteps // all done
  if (status === "in_progress") {
    // Estimate progress through stages based on expense activity
    const midway = Math.floor(totalSteps / 2)
    return totalExpenses > 0 ? Math.min(midway + 1, totalSteps - 2) : midway
  }
  if (guidePurchased) return 1 // Getting quotes = about to start step 2 (index 1)
  return 0 // Planning
}

// ─── Node component ───────────────────────────────────────────────────────────

function TimelineNode({
  state,
  idx,
  isLast,
  title,
  description,
}: {
  state: StepState
  idx: number
  isLast: boolean
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4">
      {/* Line + dot column */}
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Dot */}
        <div className={cn(
          "w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
          state === "done"
            ? "border-primary bg-primary"
            : state === "active"
              ? "border-primary bg-[hsl(var(--brand-soft))] shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]"
              : "border-border bg-background"
        )}>
          {state === "done" ? (
            <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2.5} />
          ) : state === "active" ? (
            <div className="w-2 h-2 rounded-full bg-primary" />
          ) : (
            <span className="text-[10px] font-semibold text-muted-foreground/50">{idx + 1}</span>
          )}
        </div>
        {/* Connecting line */}
        {!isLast && (
          <div className={cn(
            "w-0.5 flex-1 min-h-[2rem] mt-1",
            state === "done" ? "bg-primary/30" : "bg-border"
          )} />
        )}
      </div>

      {/* Content */}
      <div className={cn(
        "pb-8 flex-1 min-w-0",
        isLast && "pb-0"
      )}>
        <p className={cn(
          "text-[14px] font-semibold leading-snug",
          state === "upcoming" ? "text-muted-foreground" : "text-foreground"
        )}>
          {title}
        </p>
        <p className={cn(
          "text-[12px] mt-1 leading-relaxed",
          state === "upcoming" ? "text-muted-foreground/60" : "text-muted-foreground"
        )}>
          {description}
        </p>
        {state === "active" && (
          <span className="inline-flex items-center mt-2 text-[11px] font-semibold text-primary bg-[hsl(var(--brand-soft))] px-2 py-0.5 rounded-full">
            You are here
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TimelinePage() {
  const { activeProject, loading: projectLoading } = useActiveProject()
  const supabase = createSupabaseBrowserClient()

  const [guideSteps, setGuideSteps]   = useState<WorkStep[] | null>(null)
  const [totalSpent, setTotalSpent]   = useState(0)
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!activeProject) { setDataLoading(false); return }

    const load = async () => {
      // Try guide work sequence
      const { data: guide } = await supabase
        .from("renovation_guides")
        .select("work_sequence")
        .eq("project_id", activeProject.id)
        .maybeSingle()

      if (guide?.work_sequence && Array.isArray(guide.work_sequence) && guide.work_sequence.length > 0) {
        setGuideSteps(guide.work_sequence as WorkStep[])
      }

      // Total expenses for progress estimation
      const { data: expenses } = await supabase
        .from("expenses")
        .select("amount")
        .eq("project_id", activeProject.id)

      if (expenses) {
        setTotalSpent(expenses.reduce((s: number, e: { amount: number }) => s + (e.amount ?? 0), 0))
      }

      setDataLoading(false)
    }

    load()
  }, [activeProject?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (projectLoading || dataLoading) {
    return (
      <div className="max-w-lg space-y-6 animate-pulse">
        <div className="h-7 w-40 bg-muted rounded-lg" />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="h-4 w-36 bg-muted rounded" />
              <div className="h-3 w-64 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center py-24 text-center">
        <p className="text-[13px] text-muted-foreground">No active project.</p>
      </div>
    )
  }

  // Build step list — prefer AI guide steps, fall back to defaults
  const stages: { title: string; description: string }[] = guideSteps
    ? guideSteps.map(s => ({ title: s.title, description: s.description }))
    : (DEFAULT_STAGES[activeProject.room_type ?? ""] ?? FALLBACK_STAGES)

  const currentStep = deriveCurrentStep(
    activeProject.guide_purchased,
    activeProject.status ?? "planning",
    stages.length,
    totalSpent
  )

  const completedCount = Math.min(currentStep, stages.length)
  const progressPct    = stages.length > 0 ? Math.round((completedCount / stages.length) * 100) : 0

  return (
    <div className="max-w-lg space-y-6">

      {/* Header */}
      <div>
        <h1 className="font-serif text-[22px] font-semibold text-foreground">Timeline</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          {completedCount} of {stages.length} stages complete · {progressPct}% through your renovation
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-700"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Timeline */}
      <div className="pt-2">
        {stages.map((stage, idx) => (
          <TimelineNode
            key={idx}
            idx={idx}
            state={getStepState(idx, currentStep, stages.length)}
            isLast={idx === stages.length - 1}
            title={stage.title}
            description={stage.description}
          />
        ))}
      </div>

    </div>
  )
}
