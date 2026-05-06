"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Loader2, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface MaterialItem {
  item: string
  qty: string
  unit: string
  est_cost: string
}

interface WorkStep {
  step: number
  title: string
  description: string
  why: string
}

interface Contractor {
  trade: string
  when: string
  notes: string
}

interface Guide {
  materials_list: MaterialItem[]
  work_sequence: WorkStep[]
  contractors_needed: Contractor[]
  quote_questions: string[]
  red_flags: string[]
}

interface Project {
  id: string
  name: string
  budget: number
  guide_purchased: boolean
}

// ─── Collapsible section ──────────────────────────────────────────────────────

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-[14px] border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 bg-card hover:bg-muted/30 transition-colors"
      >
        <span className="text-[14px] font-semibold text-foreground">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1 bg-card">{children}</div>}
    </div>
  )
}

// ─── Generating state ─────────────────────────────────────────────────────────

function GeneratingGuide() {
  const [dots, setDots] = useState("")
  useEffect(() => {
    const t = setInterval(() => setDots((d) => (d.length >= 3 ? "" : d + ".")), 500)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
        <p className="text-[15px] font-semibold text-foreground">Building your renovation guide{dots}</p>
        <p className="text-[13px] text-muted-foreground">This takes about 20–30 seconds.</p>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function GuidePage() {
  const { projectId } = useParams<{ projectId: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [project, setProject] = useState<Project | null>(null)
  const [guide, setGuide] = useState<Guide | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [notFound, setNotFound] = useState(false)

  // Poll for guide readiness when generating
  useEffect(() => {
    if (!generating) return
    const interval = setInterval(async () => {
      const res = await fetch(`/api/guide/${projectId}`)
      if (res.ok) {
        const { guide: g } = await res.json()
        if (g) {
          setGuide(g as Guide)
          setGenerating(false)
        }
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [generating, projectId])

  useEffect(() => {
    if (!projectId) return

    const fetchData = async () => {
      const res = await fetch(`/api/guide/${projectId}`)

      if (res.status === 404) {
        setNotFound(true)
        setLoading(false)
        return
      }

      if (res.status === 403) {
        router.replace(`/results/${searchParams.get("session_id") ?? projectId}`)
        return
      }

      if (!res.ok) {
        setNotFound(true)
        setLoading(false)
        return
      }

      const { project: proj, guide: g } = await res.json()
      setProject(proj as Project)

      if (g) {
        setGuide(g as Guide)
      } else {
        setGenerating(true)
      }

      setLoading(false)
    }

    fetchData()
  }, [projectId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <div>
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-[18px] font-semibold mb-2">Guide not found</h2>
          <button
            onClick={() => router.push("/start")}
            className="px-5 py-2.5 rounded-[10px] text-[13px] font-semibold bg-primary text-primary-foreground"
          >
            Start a new analysis
          </button>
        </div>
      </div>
    )
  }

  if (generating || !guide) {
    return <GeneratingGuide />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[680px] mx-auto px-4 py-8 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-foreground">Alinnia</span>
          <button
            onClick={() => router.push(`/control-centre/overview?project=${projectId}`)}
            className="text-[12px] text-primary font-medium hover:underline"
          >
            Open project tracker →
          </button>
        </div>

        <div>
          <h1 className="font-serif text-[26px] font-semibold text-foreground">{project?.name}</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            Your complete renovation guide · ${Number(project?.budget ?? 0).toLocaleString()} budget
          </p>
        </div>

        {/* Materials */}
        <Section title={`Materials list (${guide.materials_list.length} items)`}>
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Item</th>
                  <th className="text-right py-2 pr-4 text-muted-foreground font-medium">Qty</th>
                  <th className="text-right py-2 pr-4 text-muted-foreground font-medium">Unit</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Est. cost</th>
                </tr>
              </thead>
              <tbody>
                {guide.materials_list.map((m, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-2 pr-4 text-foreground">{m.item}</td>
                    <td className="py-2 pr-4 text-right text-foreground">{m.qty}</td>
                    <td className="py-2 pr-4 text-right text-muted-foreground">{m.unit}</td>
                    <td className="py-2 text-right text-foreground font-medium">{m.est_cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* Work sequence */}
        <Section title="Step-by-step work sequence">
          <ol className="space-y-4 mt-1">
            {guide.work_sequence.map((s) => (
              <li key={s.step} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {s.step}
                </span>
                <div className="space-y-0.5">
                  <p className="text-[13px] font-semibold text-foreground">{s.title}</p>
                  <p className="text-[12px] text-foreground/80">{s.description}</p>
                  <p className="text-[11px] text-muted-foreground italic">{s.why}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {/* Contractors */}
        <Section title="Contractors you'll need">
          <div className="space-y-3 mt-1">
            {guide.contractors_needed.map((c, i) => (
              <div key={i} className="rounded-[10px] bg-muted/30 p-3 space-y-0.5">
                <p className="text-[13px] font-semibold text-foreground">{c.trade}</p>
                <p className="text-[11.5px] text-primary font-medium">{c.when}</p>
                <p className="text-[11.5px] text-muted-foreground">{c.notes}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Quote questions */}
        <Section title="What to ask when getting quotes">
          <ul className="space-y-2 mt-1">
            {guide.quote_questions.map((q, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[12.5px] text-foreground">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                {q}
              </li>
            ))}
          </ul>
        </Section>

        {/* Red flags */}
        <Section title="Red flags to watch for" defaultOpen={false}>
          <ul className="space-y-2 mt-1">
            {guide.red_flags.map((f, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[12.5px] text-foreground">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </Section>

        {/* CTA to project tracker */}
        <div className="rounded-[14px] border border-primary/20 bg-[hsl(var(--brand-soft))] p-5 text-center space-y-3">
          <p className="text-[14px] font-semibold text-foreground">Ready to start managing your project?</p>
          <p className="text-[12px] text-muted-foreground">
            Your guide phases have been added to your project tracker. Track spending, timelines, and tasks in one place.
          </p>
          <button
            onClick={() => router.push("/control-centre")}
            className="px-5 py-2.5 rounded-[10px] text-[13px] font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all"
          >
            Open project tracker →
          </button>
        </div>
      </div>
    </div>
  )
}
