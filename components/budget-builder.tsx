"use client"

import { useState, useMemo } from "react"
import { useActiveProject } from "@/contexts/project-context"
import { BUDGET_CATEGORIES, SCOPE_CATEGORIES, DEFAULT_AREA } from "@/lib/budget-intelligence-data"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

// ─── Room type → scope key mapping ───────────────────────────────────────────

const ROOM_TO_SCOPE: Record<string, string> = {
  bathroom:      "bathroom-reno",
  kitchen:       "kitchen-reno",
  bedroom:       "bedroom-reno",
  "living-room": "bedroom-reno",
  "full-home":   "full-reno",
  extension:     "extension",
  "multi-room":  "multi-room",
  outdoor:       "extension",
}

// ─── Category colours ─────────────────────────────────────────────────────────

const COLOURS = ["#6366f1", "#22c55e", "#f97316", "#a855f7", "#0ea5e9", "#ef4444", "#78716c"]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(2)}m`
  if (n >= 1_000)     return `£${Math.round(n / 1_000)}k`
  return `£${Math.round(n)}`
}

function fmtFull(n: number) {
  return `£${Math.round(n).toLocaleString("en-GB")}`
}

// ─── Custom donut centre label ────────────────────────────────────────────────

function DonutCentre({ total, budget, cx, cy }: {
  total: number; budget: number; cx: number; cy: number
}) {
  const over = total > budget
  return (
    <g>
      <text
        x={cx} y={cy - 10}
        textAnchor="middle"
        className="fill-foreground"
        style={{ fontSize: 20, fontWeight: 700, fontFamily: "inherit" }}
      >
        {fmt(total)}
      </text>
      <text
        x={cx} y={cy + 12}
        textAnchor="middle"
        style={{ fontSize: 11, fill: over ? "#ef4444" : "#6b7280", fontFamily: "inherit" }}
      >
        {over ? `£${Math.round(total - budget).toLocaleString()} over` : "estimated"}
      </text>
    </g>
  )
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function RingTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const { name, value, color } = payload[0].payload
  return (
    <div className="rounded-[10px] border border-border bg-card px-3 py-2 shadow-sm text-[12px]">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="font-medium text-foreground">{name}</span>
      </div>
      <p className="text-muted-foreground mt-0.5">{fmtFull(value)}</p>
    </div>
  )
}

// ─── Variant button ───────────────────────────────────────────────────────────

function VariantButton({
  label, pricePerSqm, total, selected, onClick,
}: {
  label: string; pricePerSqm: number; total: number
  selected: boolean; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-[10px] border-[1.5px] px-3 py-2.5 transition-all",
        selected
          ? "border-primary bg-[hsl(var(--brand-soft))] shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
          : "border-border hover:border-primary/40 hover:bg-muted/30"
      )}
    >
      <p className={cn("text-[12px] font-semibold", selected ? "text-primary" : "text-foreground")}>
        {label}
      </p>
      <div className="flex items-baseline justify-between mt-0.5 gap-2">
        <span className="text-[11px] text-muted-foreground">£{pricePerSqm}/m²</span>
        <span className="text-[11px] font-mono font-medium text-foreground">{fmtFull(total)}</span>
      </div>
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function BudgetBuilder() {
  const { activeProject } = useActiveProject()

  const scopeKey  = ROOM_TO_SCOPE[activeProject?.room_type ?? ""] ?? "bathroom-reno"
  const relevantIds = SCOPE_CATEGORIES[scopeKey] ?? BUDGET_CATEGORIES.map(c => c.id)
  const categories  = BUDGET_CATEGORIES.filter(c => relevantIds.includes(c.id))

  const defaultAreaSqm = activeProject?.total_area ?? DEFAULT_AREA[scopeKey]?.sqm ?? 10
  const [area, setArea] = useState(String(defaultAreaSqm))
  const areaSqm = parseFloat(area) || defaultAreaSqm

  const [selected, setSelected] = useState<Record<string, number>>(
    Object.fromEntries(categories.map(c => [c.id, c.defaultVariantIndex]))
  )

  const budget = Number(activeProject?.budget ?? 0)
  const city   = (activeProject?.zip_code ?? "").split(",")[0] || "your area"

  const lineItems = useMemo(() =>
    categories.map((cat, idx) => {
      const vi      = selected[cat.id] ?? cat.defaultVariantIndex
      const variant = cat.variants[vi]
      const total   = variant.fallbackPriceUKsqm * areaSqm
      return { cat, variant, vi, total, colour: COLOURS[idx % COLOURS.length] }
    }),
    [categories, selected, areaSqm]
  )

  const totalEstimate = lineItems.reduce((s, l) => s + l.total, 0)
  const remaining     = budget - totalEstimate
  const usedPct       = Math.min(100, (totalEstimate / budget) * 100)
  const isOver        = remaining < 0
  const isClose       = !isOver && remaining < budget * 0.1

  // Donut ring doesn't render well with all-zero data — add a ghost slice when empty
  const ringData = lineItems.length > 0
    ? lineItems.map(l => ({ name: l.cat.name, value: Math.round(l.total), color: l.colour }))
    : [{ name: "—", value: 1, color: "#e5e7eb" }]

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center py-24 text-center">
        <p className="text-[13px] text-muted-foreground">No active project.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">

      {/* ── Header ── */}
      <div>
        <h1 className="font-serif text-[22px] font-semibold text-foreground">Budget builder</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Adjust finish levels to see how your budget holds up — based on{" "}
          <span className="font-medium text-foreground">{areaSqm} m²</span> in{" "}
          <span className="font-medium text-foreground">{city}</span>.
        </p>
      </div>

      {/* ── Area override ── */}
      <div className="flex items-center gap-3">
        <label className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
          Floor area
        </label>
        <div className="relative w-28">
          <input
            type="number"
            min={1}
            step={0.5}
            value={area}
            onChange={e => setArea(e.target.value)}
            className="w-full h-8 pl-3 pr-8 rounded-[8px] border border-border bg-muted text-[13px] font-mono text-foreground focus:outline-none focus:border-primary transition-colors"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">m²</span>
        </div>
        {activeProject.total_area && Number(area) !== activeProject.total_area && (
          <button
            type="button"
            onClick={() => setArea(String(activeProject.total_area))}
            className="text-[11px] text-primary hover:underline"
          >
            Reset to {activeProject.total_area} m²
          </button>
        )}
      </div>

      {/* ── Ring + legend ── */}
      <div className="rounded-[18px] border border-border bg-card p-5">
        <div className="flex flex-col sm:flex-row items-center gap-6">

          {/* Donut ring */}
          <div className="relative flex-shrink-0" style={{ width: 220, height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ringData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                  label={(props) =>
                    <DonutCentre
                      total={totalEstimate}
                      budget={budget}
                      cx={props.cx}
                      cy={props.cy}
                    />
                  }
                >
                  {ringData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<RingTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend + budget bar */}
          <div className="flex-1 space-y-4 w-full">
            {/* Category legend */}
            <ul className="space-y-1.5">
              {lineItems.map(l => (
                <li key={l.cat.id} className="flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.colour }} />
                    <span className="text-foreground">{l.cat.name}</span>
                  </span>
                  <span className="font-mono text-muted-foreground">{fmtFull(l.total)}</span>
                </li>
              ))}
            </ul>

            {/* Budget health bar */}
            <div className="space-y-1.5 pt-1 border-t border-border">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">Your budget</span>
                <span className="font-mono font-semibold text-foreground">{fmtFull(budget)}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${usedPct}%`,
                    background: isOver ? "#ef4444" : isClose ? "#f59e0b" : "#22c55e",
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className={cn(
                  "font-medium",
                  isOver ? "text-red-500" : isClose ? "text-amber-500" : "text-green-600"
                )}>
                  {isOver
                    ? `${fmtFull(Math.abs(remaining))} over budget`
                    : `${fmtFull(remaining)} remaining`}
                </span>
                <span className="text-muted-foreground">{Math.round(usedPct)}% used</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category cards ── */}
      <div className="space-y-4">
        {lineItems.map(l => (
          <div key={l.cat.id} className="rounded-[16px] border border-border bg-card p-4 space-y-3">
            {/* Card header */}
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.colour }} />
              <l.cat.icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.6} />
              <p className="text-[13px] font-semibold text-foreground">{l.cat.name}</p>
              <span className="ml-auto text-[12px] font-mono text-muted-foreground">
                {fmtFull(l.total)}
              </span>
            </div>

            {/* Variant grid */}
            <div className={cn(
              "grid gap-2",
              l.cat.variants.length <= 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4"
            )}>
              {l.cat.variants.map((v, vi) => (
                <VariantButton
                  key={v.id}
                  label={v.label}
                  pricePerSqm={v.fallbackPriceUKsqm}
                  total={v.fallbackPriceUKsqm * areaSqm}
                  selected={l.vi === vi}
                  onClick={() => setSelected(prev => ({ ...prev, [l.cat.id]: vi }))}
                />
              ))}
            </div>

            {/* Description of selected variant */}
            <p className="text-[11.5px] text-muted-foreground leading-relaxed pl-0.5">
              {l.variant.description}
            </p>
          </div>
        ))}
      </div>

      {/* ── Total summary row ── */}
      <div className="rounded-[14px] bg-muted p-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Total estimate
          </p>
          <p className="text-[22px] font-bold font-mono text-foreground mt-0.5">
            {fmtFull(totalEstimate)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-muted-foreground">Based on {areaSqm} m²</p>
          <p className={cn(
            "text-[13px] font-semibold mt-0.5",
            isOver ? "text-red-500" : isClose ? "text-amber-500" : "text-green-600"
          )}>
            {isOver
              ? `${fmtFull(Math.abs(remaining))} over your budget`
              : `${fmtFull(remaining)} left in your budget`}
          </p>
        </div>
      </div>

    </div>
  )
}
