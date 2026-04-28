"use client"

import { useEffect, useState, useRef } from "react"
import { useActiveProject } from "@/contexts/project-context"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import { getProjectExpenses, getProjectTasks } from "@/lib/project-queries"
import type { Expense, Task } from "@/lib/project-queries"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { cn } from "@/lib/utils"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, currency = 'USD') {
  const symbols: Record<string, string> = {
    USD: '$', CAD: 'C$', GBP: '£', EUR: '€', AED: 'AED ', AUD: 'A$', SAR: '﷼',
  }
  const sym = symbols[currency] || '$'
  if (n >= 1_000_000) return `${sym}${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${sym}${(n / 1_000).toFixed(1)}K`
  return `${sym}${n.toFixed(0)}`
}

function daysBetween(a: string | null, b: string | null) {
  if (!a || !b) return null
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000)
}

function fmtDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

function Confetti({ active }: { active: boolean }) {
  const colors = ['#C4622D', '#E8A880', '#F5E6DC', '#15803D', '#DCFCE7', '#B45309', '#FEF3C7']
  if (!active) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: 52 }).map((_, i) => {
        const color = colors[i % colors.length]
        const left = `${Math.random() * 100}%`
        const delay = `${Math.random() * 2}s`
        const dur = `${2.5 + Math.random() * 2}s`
        const size = `${7 + Math.random() * 7}px`
        const radius = Math.random() > 0.5 ? '50%' : '2px'
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left,
              top: '-10px',
              width: size,
              height: size,
              background: color,
              borderRadius: radius,
              animation: `confetti-fall ${dur} ${delay} ease-in forwards`,
            }}
          />
        )
      })}
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(0) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white/8 backdrop-blur-sm rounded-[10px] p-3 text-center">
      <div className="font-serif text-[20px] font-semibold text-white leading-none">{value}</div>
      <div className="text-[10px] text-white/60 mt-1">{label}</div>
    </div>
  )
}

// ─── Record row ───────────────────────────────────────────────────────────────

function RecordRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/60 last:border-0 last:pb-0">
      <span className="text-[12px] text-muted-foreground">{label}</span>
      <span className={cn("text-[12px] font-medium text-foreground text-right max-w-[60%]", valueClass)}>{value}</span>
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-[11px] font-medium text-foreground/80">
      {children}
    </span>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CloseoutPage() {
  const { activeProject, loading: projectLoading } = useActiveProject()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [confetti, setConfetti] = useState(false)
  const [rating, setRating] = useState(0)
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfDone, setPdfDone] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const hasLaunched = useRef(false)

  useEffect(() => {
    if (!activeProject) { setDataLoading(false); return }
    const supabase = createSupabaseBrowserClient()
    setDataLoading(true)
    Promise.all([
      getProjectExpenses(supabase, activeProject.id),
      getProjectTasks(supabase, activeProject.id),
    ]).then(([exp, tsk]) => {
      setExpenses(exp)
      setTasks(tsk)
      setDataLoading(false)
      if (!hasLaunched.current) {
        hasLaunched.current = true
        setConfetti(true)
        setTimeout(() => setConfetti(false), 5000)
      }
    })
  }, [activeProject])

  const loading = projectLoading || dataLoading

  if (loading) {
    return (
      <div className="space-y-4 max-w-xl mx-auto">
        <Skeleton className="h-52 rounded-[18px]" />
        <Skeleton className="h-64 rounded-[18px]" />
        <Skeleton className="h-32 rounded-[18px]" />
      </div>
    )
  }

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-muted-foreground mb-4">No active project found.</p>
        <Link href="/auth/signup/wizard" className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white">
          Start a project
        </Link>
      </div>
    )
  }

  const budget = activeProject.budget ?? 0
  const spent = expenses.reduce((s, e) => s + e.amount, 0)
  const saved = budget - spent
  const days = daysBetween(activeProject.start_date ?? null, activeProject.end_date ?? null)
  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.status === 'done').length

  // Largest spend category (by summing expense amounts naively — no category field so use phase or type)
  const largestCategory = expenses.length > 0
    ? (() => {
        const map: Record<string, number> = {}
        expenses.forEach(e => {
          const cat = (e as any).category || 'General'
          map[cat] = (map[cat] || 0) + e.amount
        })
        const [name, val] = Object.entries(map).sort((a, b) => b[1] - a[1])[0] || ['—', 0]
        return `${name} · ${fmt(val)}`
      })()
    : '—'

  const handleDownloadPdf = () => {
    setPdfLoading(true)
    setTimeout(() => { setPdfLoading(false); setPdfDone(true) }, 1800)
  }

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {})
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2500)
  }

  return (
    <>
      <Confetti active={confetti} />

      <div className="max-w-xl mx-auto space-y-4 pb-12">

        {/* ── Hero ── */}
        <div className="relative overflow-hidden rounded-[18px] bg-[#1C1917] px-7 py-8 text-center">
          {/* decorative blobs */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-primary/18" />
          <div className="pointer-events-none absolute -bottom-8 -left-6 h-28 w-28 rounded-full bg-[#E8A880]/10" />

          {/* Check */}
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-[0_0_0_8px_rgba(21,128,61,0.15)]">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M5 13L10 18L21 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 className="relative font-serif text-[28px] font-semibold text-white mb-2">
            Project complete.
          </h1>
          <p className="relative text-[13px] text-white/60 leading-relaxed max-w-[300px] mx-auto mb-6">
            {activeProject.name} is finished.
            {totalTasks > 0 && ` ${doneTasks} tasks completed.`}
            {' '}Every dollar tracked. Well done.
          </p>

          <div className="relative grid grid-cols-3 gap-2.5">
            <StatCard value={fmt(spent)} label="Total spent" />
            <StatCard value={days ? `${days}d` : '—'} label="Days total" />
            <StatCard
              value={saved >= 0 ? fmt(Math.abs(saved)) : `-${fmt(Math.abs(saved))}`}
              label={saved >= 0 ? 'Under budget' : 'Over budget'}
            />
          </div>
        </div>

        {/* ── Project Record ── */}
        <div className="bg-card rounded-[18px] shadow-[0_2px_8px_rgba(28,25,23,0.08),0_1px_2px_rgba(28,25,23,0.04)] overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-serif text-[17px] font-semibold text-foreground">Project Record</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              A permanent record of everything that was built, spent, and completed.
            </p>
          </div>

          <div className="px-5 py-4 space-y-5">
            {/* Summary */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.06em] mb-2">Summary</p>
              <RecordRow label="Project name" value={activeProject.name} />
              <RecordRow label="Start date" value={fmtDate(activeProject.start_date ?? null)} />
              <RecordRow label="Target completion" value={fmtDate(activeProject.end_date ?? null)} />
              <RecordRow label="Location" value={[activeProject.city, activeProject.country].filter(Boolean).join(', ') || '—'} />
            </div>

            {/* Final spend */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.06em] mb-2">Final spend</p>
              <RecordRow label="Original budget" value={fmt(budget)} />
              <RecordRow label="Total spent" value={fmt(spent)} />
              <RecordRow
                label={saved >= 0 ? 'Saved vs. budget' : 'Over budget'}
                value={`${fmt(Math.abs(saved))} (${budget > 0 ? Math.abs(Math.round((saved / budget) * 100)) : 0}%)`}
                valueClass={saved >= 0 ? 'text-emerald-600' : 'text-amber-600'}
              />
              <RecordRow label="Largest category" value={largestCategory} />
            </div>

            {/* Progress */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.06em] mb-2">Tasks</p>
              <RecordRow label="Total tasks" value={String(totalTasks)} />
              <RecordRow label="Completed" value={`${doneTasks} of ${totalTasks}`} valueClass={doneTasks === totalTasks ? 'text-emerald-600' : undefined} />
            </div>

            {/* Documents */}
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-[0.06em] mb-2">Documents & permits</p>
              <div className="flex flex-wrap gap-2">
                <Badge>📄 Project drawings</Badge>
                <Badge>📋 Permits & approvals</Badge>
                <Badge>📝 Contracts</Badge>
                <Badge>🧾 All receipts</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">View all files in the Files tab.</p>
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="space-y-2.5">
          <button
            onClick={handleDownloadPdf}
            className="w-full flex items-center justify-center gap-2.5 rounded-[14px] bg-primary px-5 py-3.5 text-[13px] font-semibold text-white shadow-[0_2px_8px_hsl(var(--primary)/0.3)] hover:opacity-90 transition-all"
          >
            {pdfLoading ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Generating PDF…
              </>
            ) : pdfDone ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Project Record downloaded
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2V10M5 7L8 10L11 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 13H14" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Download Project Record PDF
              </>
            )}
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2.5 rounded-[14px] bg-card border-[1.5px] border-border px-5 py-3.5 text-[13px] font-semibold text-foreground hover:bg-muted transition-all"
          >
            {linkCopied ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Link copied to clipboard
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M6.5 9.5L9.5 6.5M5.5 7L3.5 9A2.83 2.83 0 004.5 13.5 2.83 2.83 0 009 12.5L11 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M10.5 9L12.5 7A2.83 2.83 0 0011.5 2.5 2.83 2.83 0 007 3.5L5 5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                Share live record link
              </>
            )}
          </button>

          <Link
            href="/auth/signup/wizard"
            className="w-full flex items-center justify-center gap-2.5 rounded-[14px] bg-card border-[1.5px] border-border px-5 py-3.5 text-[13px] font-semibold text-foreground hover:bg-muted transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
              <path d="M8 5V11M5 8H11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            Start a new project
          </Link>
        </div>

        {/* ── Feedback ── */}
        <div className="bg-[hsl(var(--brand-soft))] border border-primary/18 rounded-[18px] px-5 py-5">
          <h3 className="text-[13px] font-semibold text-foreground mb-1">How did Alinnia do?</h3>
          <p className="text-[12px] text-muted-foreground mb-4 leading-relaxed">
            Your feedback shapes the next version. Takes 30 seconds.
          </p>
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={cn(
                  "text-[24px] transition-all",
                  n <= rating ? "grayscale-0 opacity-100 scale-110" : "grayscale opacity-40"
                )}
              >
                ⭐
              </button>
            ))}
          </div>
          <textarea
            className="w-full resize-none rounded-[10px] bg-card border-[1.5px] border-border px-3 py-2.5 text-[12px] text-foreground font-sans outline-none focus:border-primary transition-colors h-[68px]"
            placeholder="What helped most? What was missing?"
          />
          <button
            onClick={() => setFeedbackSent(true)}
            className="mt-3 flex items-center justify-center rounded-[10px] bg-primary px-5 py-2.5 text-[12px] font-semibold text-white shadow-[0_2px_8px_hsl(var(--primary)/0.3)] hover:opacity-90 transition-all"
          >
            {feedbackSent ? '✓ Thanks — that means a lot' : 'Send feedback'}
          </button>
        </div>

        {/* ── Quiet exit ── */}
        <div className="text-center pb-2">
          <button className="text-[12px] text-muted-foreground hover:text-foreground transition-colors">
            That's all for now — I'm done ✓
          </button>
        </div>

      </div>
    </>
  )
}
