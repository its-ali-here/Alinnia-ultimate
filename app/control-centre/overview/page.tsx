"use client"

export default function OverviewPage() {
  return (
    <div className="space-y-3">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Budget used</p>
          <p className="font-serif text-3xl font-semibold text-foreground leading-tight">$34.2K</p>
          <p className="text-[10px] text-amber-600 mt-1">of $55K total · 62%</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Days remaining</p>
          <p className="font-serif text-3xl font-semibold text-foreground leading-tight">28</p>
          <p className="text-[10px] text-muted-foreground mt-1">Estimated done Aug 15</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Tasks complete</p>
          <p className="font-serif text-3xl font-semibold text-foreground leading-tight">19/34</p>
          <p className="text-[10px] text-emerald-600 mt-1">56% complete</p>
        </div>
      </div>

      {/* Budget overview */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">Budget overview</p>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">$12K remaining</span>
        </div>
        <div className="flex h-2.5 overflow-hidden rounded-full bg-muted mb-2">
          <div className="bg-primary" style={{ width: "62%" }} />
          <div className="bg-[hsl(var(--brand-light))] opacity-80" style={{ width: "16%" }} />
        </div>
        <div className="flex gap-4 text-[10px] text-muted-foreground">
          <span><span className="text-primary">■</span> Spent $34.2K</span>
          <span><span className="text-[hsl(var(--brand-light))]">■</span> Committed $8.8K</span>
          <span>■ Available $12K</span>
        </div>
      </div>

      {/* Needs attention */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold text-foreground mb-3">Needs attention</p>
        <div className="divide-y divide-border">
          <div className="flex items-start gap-2.5 py-2.5">
            <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-[1.5px] border-muted-foreground/40" />
            <div>
              <p className="text-[12.5px] text-foreground">Confirm tile delivery date — Acme Supply</p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Due today</span>
                <span className="text-[10px] text-muted-foreground">Materials</span>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2.5 py-2.5">
            <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-[1.5px] border-muted-foreground/40" />
            <div>
              <p className="text-[12.5px] text-foreground">Schedule electrical inspection (permit #2042)</p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="rounded-full bg-[hsl(var(--brand-soft))] px-2 py-0.5 text-[10px] font-semibold text-primary">Aug 2</span>
                <span className="text-[10px] text-muted-foreground">Electrical</span>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2.5 py-2.5 border-b-0">
            <div className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-[1.5px] border-muted-foreground/40" />
            <div>
              <p className="text-[12.5px] text-foreground">Sign cabinet installation contract — KBF Designs</p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Aug 5</span>
                <span className="text-[10px] text-muted-foreground">Contracts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold text-foreground mb-3">Recent activity</p>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between py-2.5">
            <div>
              <p className="text-[12.5px] text-foreground">Electrical rough-in completed ✓</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Jul 22 · Milestone</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">Done</span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <div>
              <p className="text-[12.5px] text-foreground">Cabinet order placed — KBF Designs</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Jul 20 · $8,400 committed</p>
            </div>
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">Pending</span>
          </div>
          <div className="flex items-center justify-between py-2.5">
            <div>
              <p className="text-[12.5px] text-foreground">3 punch list items added by contractor</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Jul 18 · Punch list</p>
            </div>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">Review</span>
          </div>
        </div>
      </div>
    </div>
  )
}
