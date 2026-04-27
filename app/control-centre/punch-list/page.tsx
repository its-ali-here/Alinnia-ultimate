"use client"

import { useState } from "react"
import { Share2, Camera } from "lucide-react"

type Status = "open" | "progress" | "done"

const initialItems = [
  { id: 1, text: "Confirm tile pattern direction with owner before install", category: "Tile", status: "open" as Status, photos: 1 },
  { id: 2, text: "Patch drywall behind dishwasher nook — hairline crack", category: "Drywall", status: "open" as Status, photos: 0 },
  { id: 3, text: "Caulk gap at backsplash/counter junction (east wall)", category: "Finishes", status: "progress" as Status, photos: 2 },
  { id: 4, text: "Install under-cabinet LED strips (5 runs, west wall)", category: "Electrical", status: "open" as Status, photos: 0 },
  { id: 5, text: "Touch up paint at cabinet top trim — 2 spots", category: "Paint", status: "open" as Status, photos: 0 },
  { id: 6, text: "Deliver and stage all cabinet hardware", category: "Cabinets", status: "done" as Status, photos: 0 },
  { id: 7, text: "Remove construction debris — Phase 1 complete", category: "General", status: "done" as Status, photos: 0 },
  { id: 8, text: "Verify outlet height clearance at island (code min 12\")", category: "Electrical", status: "open" as Status, photos: 0 },
  { id: 9, text: "Apply waterproof membrane behind shower area tile", category: "Waterproofing", status: "progress" as Status, photos: 3 },
  { id: 10, text: "Check window casing alignment after drywall mud", category: "Drywall", status: "done" as Status, photos: 1 },
]

const statusLabel: Record<Status, string> = {
  open: "Open",
  progress: "In Progress",
  done: "Done",
}

const statusBadge: Record<Status, string> = {
  open: "bg-amber-100 text-amber-700",
  progress: "bg-[hsl(var(--brand-soft))] text-primary",
  done: "bg-emerald-100 text-emerald-700",
}

type FilterTab = "all" | Status

export default function PunchListPage() {
  const [items, setItems] = useState(initialItems)
  const [filter, setFilter] = useState<FilterTab>("all")

  const counts = {
    all: items.length,
    open: items.filter((i) => i.status === "open").length,
    progress: items.filter((i) => i.status === "progress").length,
    done: items.filter((i) => i.status === "done").length,
  }

  const visible = filter === "all" ? items : items.filter((i) => i.status === filter)

  const toggleItem = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "done" ? "open" : "done" }
          : item
      )
    )
  }

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: `All (${counts.all})` },
    { key: "open", label: `Open (${counts.open})` },
    { key: "progress", label: `In Progress (${counts.progress})` },
    { key: "done", label: `Done (${counts.done})` },
  ]

  return (
    <div className="space-y-3">
      {/* Tabs + share */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1 flex-wrap flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                filter === tab.key
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors">
          <Share2 className="h-3 w-3" />
          Share report
        </button>
      </div>

      {/* Items */}
      <div className="rounded-xl border border-border bg-card shadow-sm divide-y divide-border overflow-hidden">
        {visible.map((item) => (
          <div key={item.id} className="flex items-start gap-3 px-4 py-3">
            {/* Checkbox */}
            <button
              onClick={() => toggleItem(item.id)}
              className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                item.status === "done"
                  ? "border-emerald-500 bg-emerald-500"
                  : "border-muted-foreground/40 hover:border-primary"
              }`}
            >
              {item.status === "done" && (
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                  <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p className={`text-[12.5px] leading-snug ${item.status === "done" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                {item.text}
              </p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {item.category}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusBadge[item.status]}`}>
                  {statusLabel[item.status]}
                </span>
                {item.photos > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <Camera className="h-2.5 w-2.5" />
                    {item.photos} photo{item.photos > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {visible.length === 0 && (
          <div className="px-4 py-8 text-center text-xs text-muted-foreground">
            No items in this category.
          </div>
        )}
      </div>
    </div>
  )
}
