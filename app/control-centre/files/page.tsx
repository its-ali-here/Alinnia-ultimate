"use client"

import { useState } from "react"
import { Plus } from "lucide-react"

type Category = "Plans" | "Permits" | "Contracts" | "Photos" | "Receipts"

const files: { name: string; category: Category; date: string }[] = [
  { name: "Kitchen_FloorPlan_v3.pdf", category: "Plans", date: "Jul 15" },
  { name: "Electrical_Permit_2042.pdf", category: "Permits", date: "Jul 10" },
  { name: "Cabinet_Contract_KBF.pdf", category: "Contracts", date: "Jul 8" },
  { name: "Demo_Day1_Photos.zip", category: "Photos", date: "Jul 2" },
  { name: "Tile_Receipt_Acme.pdf", category: "Receipts", date: "Jul 12" },
  { name: "Structural_Drawing_R2.pdf", category: "Plans", date: "Jun 28" },
  { name: "Building_Permit_Main.pdf", category: "Permits", date: "Jun 20" },
  { name: "GC_Contract_Signed.pdf", category: "Contracts", date: "Jun 15" },
]

const categoryStyle: Record<Category, { bg: string; icon: string; badge: string }> = {
  Plans:     { bg: "bg-[hsl(var(--brand-soft))]", icon: "text-primary", badge: "bg-[hsl(var(--brand-soft))] text-primary" },
  Permits:   { bg: "bg-amber-50", icon: "text-amber-600", badge: "bg-amber-100 text-amber-700" },
  Contracts: { bg: "bg-blue-50", icon: "text-blue-600", badge: "bg-blue-100 text-blue-700" },
  Photos:    { bg: "bg-emerald-50", icon: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
  Receipts:  { bg: "bg-muted", icon: "text-muted-foreground", badge: "bg-muted text-muted-foreground" },
}

type FilterTab = "All" | Category

const tabs: FilterTab[] = ["All", "Plans", "Permits", "Contracts", "Photos", "Receipts"]

function FileIcon({ category }: { category: Category }) {
  const s = categoryStyle[category]
  return (
    <div className={`flex h-9 w-7 items-center justify-center rounded-[5px] ${s.bg} mb-2`}>
      <svg width="14" height="17" viewBox="0 0 14 17" fill="none" className={s.icon}>
        <path d="M8.5 1.5H3C2.45 1.5 2 1.95 2 2.5V14.5C2 15.05 2.45 15.5 3 15.5H11C11.55 15.5 12 15.05 12 14.5V5L8.5 1.5Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
        <path d="M8.5 1.5V5H12" stroke="currentColor" strokeWidth="1.2" />
        <path d="M4.5 8H9.5M4.5 10.5H8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export default function FilesPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("All")

  const visible = activeTab === "All" ? files : files.filter((f) => f.category === activeTab)

  return (
    <div className="space-y-3">
      {/* Category tabs */}
      <div className="flex gap-1 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
              activeTab === tab
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* File grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {visible.map((file) => {
          const s = categoryStyle[file.category]
          return (
            <div
              key={file.name}
              className="cursor-pointer rounded-lg border border-border bg-card p-3 transition-all hover:border-border/80 hover:shadow-sm"
            >
              <FileIcon category={file.category} />
              <p className="text-[11px] font-medium text-foreground leading-snug mb-1.5 break-words">{file.name}</p>
              <div className="flex items-center gap-1">
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${s.badge}`}>{file.category}</span>
                <span className="text-[9px] text-muted-foreground">{file.date}</span>
              </div>
            </div>
          )
        })}

        {/* Upload tile */}
        <div className="flex min-h-[96px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-dashed border-border transition-colors hover:bg-muted">
          <Plus className="h-5 w-5 text-muted-foreground/60" strokeWidth={1.5} />
          <span className="text-[11px] text-muted-foreground">Upload file</span>
        </div>
      </div>
    </div>
  )
}
