"use client"

import { useState, useEffect } from "react"
import { useActiveProject } from "@/contexts/project-context"

type TipCategory = "Budget" | "Materials" | "Planning" | "Timing" | "Quality"
type Market = "US" | "UK" | "both"

type Tip = {
  id: string
  category: TipCategory
  market: Market
  headline: string
  body: string
}

const TIPS: Tip[] = [
  {
    id: "t1",
    category: "Budget",
    market: "both",
    headline: "Always hold a 10% contingency",
    body: "Set aside 10% of your total budget before you start. Studies show over 80% of residential builds encounter at least one unplanned cost. If you don't need it, great — it's yours. If you do, you're prepared.",
  },
  {
    id: "t2",
    category: "Budget",
    market: "both",
    headline: "Structure first, finishes later",
    body: "Never cut costs on foundations, structure, or waterproofing. These cannot be upgraded later without tearing things apart. Save money on tiles, paint, and fixtures — those can always be swapped out.",
  },
  {
    id: "t3",
    category: "Budget",
    market: "US",
    headline: "Get three bids on every subcontract",
    body: "For any subcontract over $5,000 in the US, collecting three bids is standard practice. The spread between the lowest and highest can be 30–40%. It also gives you negotiating leverage with your preferred contractor.",
  },
  {
    id: "t4",
    category: "Budget",
    market: "UK",
    headline: "VAT reclaim on new builds",
    body: "In the UK, new residential builds can reclaim VAT on eligible materials under the DIY Housebuilders Scheme or through a VAT-registered contractor charging zero-rated VAT. Keep every receipt — this can amount to tens of thousands of pounds.",
  },
  {
    id: "t5",
    category: "Budget",
    market: "both",
    headline: "Lock in prices before you break ground",
    body: "Get supplier quotes in writing 4–6 weeks before you need the materials. Material prices can spike mid-build due to supply chain shifts. A fixed-price agreement, even with a short validity window, protects your budget.",
  },
  {
    id: "t6",
    category: "Materials",
    market: "US",
    headline: "Lumber prices are seasonal",
    body: "Framing lumber in the US typically costs 8–15% less in November through January when residential construction activity slows. If your timeline allows, buy structural timber in winter and store it on site.",
  },
  {
    id: "t7",
    category: "Materials",
    market: "UK",
    headline: "Reclaimed materials can save 20–40%",
    body: "The UK has a strong reclaimed materials market — salvage yards stock everything from Victorian bricks to hardwood flooring at a fraction of new prices. Bricks, tiles, and timber beams often have better character too.",
  },
  {
    id: "t8",
    category: "Materials",
    market: "both",
    headline: "Order 10–15% extra on tiled areas",
    body: "Always order tiles with a 10–15% overage to account for cuts, breakages, and future repairs. Tile dye lots vary between batches — if you run short later, an exact match may not be available.",
  },
  {
    id: "t9",
    category: "Materials",
    market: "both",
    headline: "Local vs imported: total cost isn't just price",
    body: "Imported materials are often cheaper per unit but carry lead times of 8–14 weeks and delivery risks. Factor in storage costs, potential re-orders, and schedule delays. Local suppliers allow just-in-time delivery and easier returns.",
  },
  {
    id: "t10",
    category: "Materials",
    market: "US",
    headline: "Steel pricing follows the construction cycle",
    body: "Rebar and structural steel costs in the US typically dip in Q4 as construction activity winds down ahead of winter. Plan steel purchases for October–November if your project schedule allows.",
  },
  {
    id: "t11",
    category: "Materials",
    market: "UK",
    headline: "Check for CE/UKCA marking on all structural materials",
    body: "Since Brexit, UK construction requires UKCA marking on structural products rather than CE marking. Non-compliant materials can cause delays or fail building control inspections. Always verify certification before ordering.",
  },
  {
    id: "t12",
    category: "Planning",
    market: "both",
    headline: "Design decisions are cheapest on paper",
    body: "Every change made on drawings costs nothing. The same change during construction can cost 10×, and after the fact can cost 100×. Front-load your decision-making — finalize all layouts, fixtures, and finishes before work starts.",
  },
  {
    id: "t13",
    category: "Planning",
    market: "US",
    headline: "Pull permits before work starts — always",
    body: "Unpermitted work in the US creates serious problems at resale and can trigger costly retrofit requirements. Permits also protect you — inspections catch problems early when they're cheap to fix.",
  },
  {
    id: "t14",
    category: "Planning",
    market: "UK",
    headline: "Building Regulations approval is separate from planning permission",
    body: "Many UK homeowners confuse planning permission with Building Regulations approval — you often need both. Building Regs cover structural integrity, insulation, and fire safety. Work without it can require rectification at your cost.",
  },
  {
    id: "t15",
    category: "Planning",
    market: "both",
    headline: "MEP coordination prevents the most expensive rework",
    body: "Mechanical, electrical, and plumbing rough-ins must be coordinated before walls close. The most common (and costly) rework in residential builds is cutting into finished walls to re-route services. Get all trades in the same room before framing.",
  },
  {
    id: "t16",
    category: "Timing",
    market: "both",
    headline: "Concrete and masonry need curing time — it can't be rushed",
    body: "Concrete achieves about 70% of its design strength after 7 days but needs 28 days to fully cure. Loading it too early or applying finishes before it's ready causes cracking and long-term structural issues.",
  },
  {
    id: "t17",
    category: "Timing",
    market: "US",
    headline: "Avoid starting exterior work in December–January",
    body: "In most of the US, concrete, stucco, and masonry work done below 40°F (4°C) requires cold-weather protection measures that add cost and complexity. Schedule exterior envelope work for spring or fall if possible.",
  },
  {
    id: "t18",
    category: "Timing",
    market: "UK",
    headline: "UK groundworks slow significantly in wet winters",
    body: "The UK's wet winters can halt groundworks for weeks. Waterlogged ground can't support plant machinery, and poured concrete won't cure properly below 5°C. Build a 4–6 week weather buffer into any groundworks phase.",
  },
  {
    id: "t19",
    category: "Quality",
    market: "both",
    headline: "Insulation is the highest-ROI spend in any build",
    body: "Upgrading insulation beyond minimum code requirements has the highest long-term return of any building investment. It reduces energy bills for decades and dramatically improves comfort. Never downgrade insulation to save money.",
  },
  {
    id: "t20",
    category: "Quality",
    market: "both",
    headline: "Waterproofing failures are the costliest defects",
    body: "Water ingress is the single most common cause of serious building defects. Spend generously on waterproofing membranes, flashings, and drainage — a £500 saving on waterproofing can lead to £50,000 in remediation costs.",
  },
  {
    id: "t21",
    category: "Quality",
    market: "US",
    headline: "Check contractor license and insurance before signing",
    body: "In the US, always verify a contractor's state license, general liability insurance, and workers' compensation coverage before signing any contract. Unlicensed or uninsured contractors can leave you personally liable for on-site accidents.",
  },
  {
    id: "t22",
    category: "Quality",
    market: "UK",
    headline: "Use a TrustMark or FMB registered contractor",
    body: "In the UK, TrustMark and Federation of Master Builders (FMB) registered contractors are independently vetted. They offer dispute resolution services and often provide deposit protection. For major works, this accreditation is worth paying a small premium.",
  },
]

const CATEGORY_STYLES: Record<TipCategory, string> = {
  Budget: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Materials: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Planning: "bg-[hsl(var(--brand-soft))] text-primary",
  Timing: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Quality: "bg-muted text-muted-foreground",
}

export function IndustryInsights() {
  const { activeProject } = useActiveProject()
  const market: Market = activeProject?.currency?.toUpperCase() === "GBP" ? "UK" : "US"

  const filtered = TIPS.filter(t => t.market === market || t.market === "both")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentIndex(i => (i + 3) % filtered.length)
    }, 45_000)
    return () => clearInterval(id)
  }, [filtered.length])

  const visibleTips = [0, 1, 2].map(offset => filtered[(currentIndex + offset) % filtered.length])

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-foreground">Industry Insights</p>
        <button
          onClick={() => setCurrentIndex(i => (i + 3) % filtered.length)}
          className="text-[10px] text-primary hover:underline"
        >
          Next tips →
        </button>
      </div>
      <div className="space-y-2.5">
        {visibleTips.map(tip => (
          <div key={tip.id} className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${CATEGORY_STYLES[tip.category]}`}>
                {tip.category}
              </span>
              {tip.market !== "both" && (
                <span className="text-[10px] text-muted-foreground">{tip.market} market</span>
              )}
            </div>
            <p className="text-[12.5px] font-medium text-foreground mb-1">{tip.headline}</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{tip.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
