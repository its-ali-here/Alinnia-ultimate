"use client"

import { useRef, useState } from "react"
import { useActiveProject } from "@/contexts/project-context"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import { searchPriceIntelligence } from "@/lib/project-queries"
import type { PriceIntelligence } from "@/lib/project-queries"
import { BUDGET_CATEGORIES, SCOPE_CATEGORIES, DEFAULT_AREA } from "@/lib/budget-intelligence-data"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Sparkles, ChevronDown, ChevronUp, Check } from "lucide-react"

export function BudgetIntelligence() {
  const { activeProject } = useActiveProject()
  const supabaseRef = useRef(createSupabaseBrowserClient())

  const isGBP = activeProject?.currency?.toUpperCase() === "GBP"
  const symbol = isGBP ? "£" : "$"
  const areaUnit = isGBP ? "sqm" : "sqft"

  // Determine relevant categories for this project scope
  const path = activeProject?.room_type ?? ""
  const relevantIds = SCOPE_CATEGORIES[path] ?? BUDGET_CATEGORIES.map(c => c.id)
  const categories = BUDGET_CATEGORIES.filter(c => relevantIds.includes(c.id))

  // Area: use project value if set, otherwise fall back to scope default
  const projectArea = activeProject?.total_area ?? null
  const scopeDefault = path ? DEFAULT_AREA[path] : null
  const defaultAreaValue = projectArea
    ?? (scopeDefault ? (isGBP ? scopeDefault.sqm : scopeDefault.sqft) : null)

  const [areaInput, setAreaInput] = useState(defaultAreaValue?.toString() ?? "")
  const areaIsEstimated = projectArea === null && defaultAreaValue !== null

  const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>(
    Object.fromEntries(categories.map(c => [c.id, c.defaultVariantIndex]))
  )
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [livePrices, setLivePrices] = useState<Record<string, PriceIntelligence[][]>>({})
  const [priceLoading, setPriceLoading] = useState<Record<string, boolean>>({})
  const [suggestions, setSuggestions] = useState<Record<string, string>>({})
  const [suggestionLoading, setSuggestionLoading] = useState<Record<string, boolean>>({})

  const area = parseFloat(areaInput) || 0

  function fmtMoney(n: number) {
    if (n >= 1_000_000) return `${symbol}${(n / 1_000_000).toFixed(2)}M`
    if (n >= 1_000) return `${symbol}${(n / 1_000).toFixed(0)}K`
    return `${symbol}${n.toFixed(0)}`
  }

  function getLivePrice(catId: string, variantIdx: number): number | null {
    const results = livePrices[catId]?.[variantIdx]
    if (!results || results.length === 0) return null
    const r = results[0]
    const unitLower = r.unit?.toLowerCase() ?? ""
    if (isGBP && !unitLower.includes("sqm") && !unitLower.includes("m2")) return null
    if (!isGBP && !unitLower.includes("sqft") && !unitLower.includes("ft2") && !unitLower.includes("sf")) return null
    return r.price
  }

  function getEffectivePrice(catId: string, variantIdx: number): number {
    const cat = categories.find(c => c.id === catId)!
    const variant = cat.variants[variantIdx]
    const live = getLivePrice(catId, variantIdx)
    if (live !== null) return live
    return isGBP ? variant.fallbackPriceUKsqm : variant.fallbackPriceUSsqft
  }

  async function fetchSuggestion(catId: string, variantIdx: number) {
    const cat = categories.find(c => c.id === catId)!
    setSuggestionLoading(s => ({ ...s, [catId]: true }))
    setSuggestions(s => ({ ...s, [catId]: "" }))
    try {
      const res = await fetch("/api/budget-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryName: cat.name,
          variants: cat.variants.map(v => v.label),
          selectedVariant: cat.variants[variantIdx].label,
          projectContext: {
            constructionPath: activeProject?.room_type,
            city: activeProject?.city,
            currency: activeProject?.currency,
            budget: activeProject?.budget,
            homeType: activeProject?.home_type,
          },
        }),
      })
      const json = await res.json()
      setSuggestions(s => ({ ...s, [catId]: json.suggestion ?? "" }))
    } catch {
      setSuggestions(s => ({ ...s, [catId]: "" }))
    } finally {
      setSuggestionLoading(s => ({ ...s, [catId]: false }))
    }
  }

  async function handleExpand(catId: string) {
    const isOpening = expandedCategory !== catId
    setExpandedCategory(isOpening ? catId : null)
    if (!isOpening || livePrices[catId]) return

    const cat = categories.find(c => c.id === catId)!
    setPriceLoading(p => ({ ...p, [catId]: true }))
    const results = await Promise.all(
      cat.variants.map(v =>
        v.priceSearchQuery
          ? searchPriceIntelligence(supabaseRef.current, v.priceSearchQuery, activeProject?.city)
          : Promise.resolve([])
      )
    )
    setLivePrices(p => ({ ...p, [catId]: results }))
    setPriceLoading(p => ({ ...p, [catId]: false }))
  }

  function handleSelectVariant(catId: string, idx: number) {
    setSelectedVariants(prev => ({ ...prev, [catId]: idx }))
    // Clear cached suggestion so "What's Best?" reflects the new selection
    setSuggestions(s => ({ ...s, [catId]: "" }))
  }

  const lineItems = categories.map(cat => {
    const variantIdx = selectedVariants[cat.id] ?? cat.defaultVariantIndex
    const variant = cat.variants[variantIdx]
    const unitPrice = getEffectivePrice(cat.id, variantIdx)
    const usingLive = getLivePrice(cat.id, variantIdx) !== null
    return { cat, variant, unitPrice, usingLive, total: unitPrice * area }
  })

  const grandTotal = lineItems.reduce((s, l) => s + l.total, 0)

  if (!activeProject) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <p className="text-sm font-semibold text-foreground mb-1">No active project</p>
        <p className="text-xs text-muted-foreground">Create a project first to use Budget Intelligence.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-6">

      {/* Project scope header */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Active project</p>
        <p className="text-xl font-semibold text-foreground">{activeProject.name}</p>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          {activeProject.room_type && (
            <span className="inline-flex items-center rounded-full bg-[hsl(var(--brand-soft))] px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              {activeProject.room_type.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
            </span>
          )}
          {activeProject.city && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {activeProject.city}{activeProject.country ? `, ${activeProject.country}` : ""}
            </span>
          )}
        </div>
      </div>

      {/* Area input */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground mb-1">Project area</p>
            {areaIsEstimated && scopeDefault ? (
              <p className="text-xs text-muted-foreground mb-3">
                Using a typical estimate for a <span className="font-medium text-foreground">{scopeDefault.label}</span>. Adjust if you know the actual area.
              </p>
            ) : projectArea ? (
              <p className="text-xs text-muted-foreground mb-3">
                From your project details.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mb-3">
                Enter your total floor area to calculate estimated costs.
              </p>
            )}
            <div className="flex items-center gap-2 max-w-xs">
              <input
                type="number"
                min="0"
                value={areaInput}
                onChange={e => setAreaInput(e.target.value)}
                placeholder="e.g. 18"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <span className="text-sm text-muted-foreground font-mono">{areaUnit}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {categories.map(cat => {
          const variantIdx = selectedVariants[cat.id] ?? cat.defaultVariantIndex
          const selectedVariant = cat.variants[variantIdx]
          const unitPrice = getEffectivePrice(cat.id, variantIdx)
          const usingLive = getLivePrice(cat.id, variantIdx) !== null
          const isExpanded = expandedCategory === cat.id
          const isLoading = priceLoading[cat.id]
          const suggestion = suggestions[cat.id]
          const isSuggestionLoading = suggestionLoading[cat.id]
          const Icon = cat.icon

          return (
            <div key={cat.id} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              {/* Card header */}
              <button
                onClick={() => handleExpand(cat.id)}
                className="w-full p-4 text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.6} />
                  </div>
                  <p className="text-[13px] font-semibold text-foreground flex-1">{cat.name}</p>
                  <span className="font-mono text-[11px] text-muted-foreground mr-1">
                    {symbol}{unitPrice}/{areaUnit}
                    {usingLive && <span className="ml-1 text-emerald-600">●</span>}
                  </span>
                  {isExpanded
                    ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
                </div>

                {!isExpanded && (
                  <div className="mt-2.5">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {cat.variants.map((v, idx) => (
                        <span
                          key={v.id}
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            variantIdx === idx
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {v.label}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">{selectedVariant.description}</p>
                    {area > 0 && (
                      <p className="mt-1.5 text-[11px] font-mono font-medium text-foreground">
                        Est. {fmtMoney(unitPrice * area)}
                      </p>
                    )}
                  </div>
                )}
              </button>

              {/* Expanded panel */}
              {isExpanded && (
                <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                  {/* Comparison table */}
                  <div className="divide-y divide-border">
                    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 pb-1.5">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Option</p>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide text-right">Base</p>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide text-right">
                        {activeProject.city ? `Near ${activeProject.city.split(",")[0]}` : "Local rate"}
                      </p>
                      <span />
                    </div>

                    {cat.variants.map((v, idx) => {
                      const livePrice = getLivePrice(cat.id, idx)
                      const baseFallback = isGBP ? v.fallbackPriceUKsqm : v.fallbackPriceUSsqft
                      const isSelected = variantIdx === idx

                      return (
                        <div
                          key={v.id}
                          className={`grid grid-cols-[1fr_auto_auto_auto] gap-2 items-start py-2.5 ${isSelected ? "bg-[hsl(var(--brand-soft))]/40 -mx-4 px-4" : ""}`}
                        >
                          <div>
                            <p className="text-[12px] font-semibold text-foreground">{v.label}</p>
                            <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{v.description}</p>
                          </div>
                          <p className="font-mono text-[11px] text-muted-foreground text-right pt-0.5 whitespace-nowrap">
                            {symbol}{baseFallback}/{areaUnit}
                          </p>
                          <div className="text-right pt-0.5 min-w-[60px]">
                            {v.priceSearchQuery === "" ? (
                              <span className="text-[10px] text-muted-foreground/50">—</span>
                            ) : isLoading ? (
                              <Skeleton className="h-3.5 w-14 rounded inline-block" />
                            ) : livePrice !== null ? (
                              <span className="font-mono text-[11px] text-emerald-600 whitespace-nowrap">
                                {symbol}{livePrice}/{areaUnit}
                              </span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground/50">—</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleSelectVariant(cat.id, idx)}
                            className={`flex items-center justify-center h-5 w-5 rounded-full border flex-shrink-0 transition-colors mt-0.5 ${
                              isSelected
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-border hover:border-primary/60"
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  {/* What's Best? */}
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    {!suggestion && !isSuggestionLoading ? (
                      <button
                        onClick={() => fetchSuggestion(cat.id, variantIdx)}
                        className="flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:opacity-80 transition-opacity"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        What&apos;s Best for my project?
                      </button>
                    ) : isSuggestionLoading ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                          <p className="text-[10px] font-semibold text-primary uppercase tracking-wide">Thinking…</p>
                        </div>
                        <Skeleton className="h-3 w-full rounded" />
                        <Skeleton className="h-3 w-4/5 rounded" />
                        <Skeleton className="h-3 w-3/5 rounded" />
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Sparkles className="h-3 w-3 text-primary" />
                          <p className="text-[10px] font-semibold text-primary uppercase tracking-wide">Suggestion</p>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{suggestion}</p>
                        <button
                          onClick={() => fetchSuggestion(cat.id, variantIdx)}
                          className="mt-2 text-[10px] text-primary hover:underline"
                        >
                          Ask again
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Subtotal */}
                  {area > 0 && (
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-[11px] text-muted-foreground">
                        {selectedVariant.label} · {area.toLocaleString()} {areaUnit}
                        {usingLive && <span className="ml-1.5 text-emerald-600 text-[10px]">local rate</span>}
                      </p>
                      <p className="font-mono text-[12px] font-semibold text-foreground">
                        {fmtMoney(unitPrice * area)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary card */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold text-foreground mb-3">Estimate summary</p>
        {area === 0 ? (
          <p className="text-xs text-muted-foreground py-2">Enter your project area above to see the estimate.</p>
        ) : (
          <>
            <div className="divide-y divide-border mb-3">
              {lineItems.map(({ cat, variant, unitPrice, usingLive, total }) => (
                <div key={cat.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-[12.5px] text-foreground">{cat.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {variant.label} · {symbol}{unitPrice}/{areaUnit}
                      {usingLive && <span className="ml-1 text-emerald-600">local</span>}
                    </p>
                  </div>
                  <span className="font-mono text-[12.5px] text-foreground ml-4">{fmtMoney(total)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <p className="text-sm font-semibold text-foreground">Total estimate</p>
              <p className="font-serif text-2xl font-semibold text-foreground">{fmtMoney(grandTotal)}</p>
            </div>
            {areaIsEstimated && (
              <p className="mt-2 text-[10px] text-amber-600/80 leading-relaxed">
                Area is estimated — update it above for a more accurate figure.
              </p>
            )}
            <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
              Based on 2024/2025 market averages for the {isGBP ? "UK" : "US"}. Excludes contingency, permits, and site-specific conditions.
              {activeProject.city && " Local rates (●) sourced from nearby price data."}
            </p>
          </>
        )}
      </div>

    </div>
  )
}
