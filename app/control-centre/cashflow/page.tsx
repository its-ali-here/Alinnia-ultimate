"use client"

const categories = [
  { name: "Cabinets & millwork", amount: "$12,400", pct: 66 },
  { name: "Labor", amount: "$9,800", pct: 52 },
  { name: "Appliances", amount: "$6,200", pct: 33 },
  { name: "Plumbing", amount: "$3,100", pct: 17 },
  { name: "Tile & flooring", amount: "$2,700", pct: 14 },
]

const transactions = [
  { name: "Cabinet delivery — KBF Designs", date: "Jul 22", amount: "−$8,400", positive: false },
  { name: "Electrician deposit", date: "Jul 18", amount: "−$2,500", positive: false },
  { name: "Permit fee refund", date: "Jul 15", amount: "+$320", positive: true },
  { name: "Tile order — Acme Supply", date: "Jul 12", amount: "−$1,840", positive: false },
  { name: "Countertop deposit", date: "Jul 8", amount: "−$1,200", positive: false },
]

export default function CashflowPage() {
  return (
    <div className="space-y-3">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Total budget</p>
          <p className="font-serif text-3xl font-semibold text-foreground leading-tight">$55K</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Spent to date</p>
          <p className="font-serif text-3xl font-semibold text-primary leading-tight">$34.2K</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-1">Available</p>
          <p className="font-serif text-3xl font-semibold text-emerald-600 leading-tight">$12K</p>
          <p className="text-[10px] text-muted-foreground mt-1">after committed spend</p>
        </div>
      </div>

      {/* Spend by category */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <p className="text-sm font-semibold text-foreground mb-4">Spend by category</p>
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground">{cat.name}</span>
                <span className="font-mono text-[11px] text-muted-foreground">{cat.amount}</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${cat.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-foreground">Transactions</p>
          <button className="rounded-md border border-border px-3 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors">
            + Add
          </button>
        </div>
        <div className="divide-y divide-border">
          {transactions.map((txn) => (
            <div key={txn.name} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-[12.5px] text-foreground">{txn.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{txn.date}</p>
              </div>
              <span className={`font-mono text-[13px] font-medium ${txn.positive ? "text-emerald-600" : "text-foreground"}`}>
                {txn.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
