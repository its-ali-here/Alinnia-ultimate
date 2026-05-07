"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowRight, Check, X } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Analysis {
  id: string
  feasibility_score: number
  achievable_pct: number
  fits_budget: string[]
  doesnt_fit_budget: string[]
  summary_text: string
}

interface Project {
  id: string
  name: string
  budget: number
  room_type: string
  zip_code: string
  guide_purchased: boolean
  session_id: string
}

// ─── Feasibility bar ──────────────────────────────────────────────────────────

function FeasibilityBar({ pct }: { pct: number }) {
  const color = pct >= 70 ? "#22c55e" : pct >= 45 ? "#f59e0b" : "#ef4444"
  return (
    <div className="space-y-1.5">
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-[11px] text-muted-foreground">Budget feasibility</p>
    </div>
  )
}

// ─── Paywall card ─────────────────────────────────────────────────────────────

function PaywallCard({ sessionId }: { projectId: string; sessionId: string }) {
  const router = useRouter()
  const VALUE_POINTS = [
    "Exact materials list with quantities — tiles, adhesive, grout, fixtures",
    "Step-by-step work sequence — what gets done in what order and why",
    "Which contractors you need and in what order",
    "What to ask when getting quotes — and what a fair price looks like",
    "Red flags checklist — what to watch for before signing anything",
    "Full project tracker to manage it all the way to completion",
  ]

  return (
    <div className="rounded-[16px] border-2 border-primary/30 bg-[hsl(var(--brand-soft))] p-5 space-y-4">
      <div>
        <h3 className="text-[17px] font-semibold text-foreground">Get your complete renovation guide</h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">Everything you need to go from decision to finished room</p>
      </div>

      <ul className="space-y-2">
        {VALUE_POINTS.map((pt, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[12.5px] text-foreground">
            <span className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 text-primary">
                <circle cx="5" cy="5" r="2" fill="currentColor" />
              </svg>
            </span>
            {pt}
          </li>
        ))}
      </ul>

      <div className="flex items-baseline gap-2">
        <span className="text-[28px] font-bold text-foreground">£79</span>
        <span className="text-[12px] text-muted-foreground">one-time · yours forever</span>
      </div>

      <button
        type="button"
        onClick={() => {
          localStorage.setItem("pendingSessionId", sessionId)
          router.push(`/auth/register?session=${sessionId}`)
        }}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-[12px] text-[14px] font-semibold bg-primary text-primary-foreground shadow-[0_2px_12px_hsl(var(--primary)/0.35)] hover:opacity-90 transition-all"
      >
        Start 3-day free trial <ArrowRight className="w-4 h-4" />
      </button>
      <p className="text-center text-[11px] text-muted-foreground">
        3 days free. Cancel before day 3 and pay nothing. No card surprises.
      </p>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const router = useRouter()

  const [project, setProject] = useState<Project | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!sessionId) return

    const fetchData = async () => {
      const res = await fetch(`/api/results/${sessionId}`)

      if (!res.ok) {
        setNotFound(true)
        setLoading(false)
        return
      }

      const { project: proj, analysis: an } = await res.json()

      setProject(proj)

      if (proj.guide_purchased) {
        router.replace(`/guide/${proj.id}`)
        return
      }

      if (an) setAnalysis(an)
      setLoading(false)
    }

    fetchData()
  }, [sessionId]) // eslint-disable-line react-hooks/exhaustive-deps

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
          <h2 className="text-[18px] font-semibold text-foreground mb-2">Analysis not found</h2>
          <p className="text-[13px] text-muted-foreground mb-6">This link may have expired or be invalid.</p>
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

  const budgetFormatted = project?.budget
    ? `$${Number(project.budget).toLocaleString()}`
    : ""

  const location = project?.zip_code ?? ""

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[560px] mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-foreground">Alinnia</span>
          <span className="text-[11px] text-muted-foreground">Free</span>
        </div>

        {/* Analysis card */}
        <div className="bg-card border border-border rounded-[18px] p-5 space-y-4">
          <div>
            <h1 className="text-[20px] font-serif font-semibold text-foreground leading-snug">
              {budgetFormatted}{location ? ` · ${location}` : ""}
            </h1>
            {analysis && (
              <p className="text-[14px] text-foreground mt-1">
                You can achieve roughly <span className="font-semibold text-primary">{Math.round(analysis.achievable_pct)}%</span> of your inspiration look
              </p>
            )}
          </div>

          {analysis && <FeasibilityBar pct={analysis.achievable_pct} />}

          {analysis && (
            <>
              <div className="space-y-1.5">
                <p className="text-[12px] font-semibold text-foreground">What fits in your budget</p>
                <ul className="space-y-1">
                  {analysis.fits_budget.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12.5px] text-foreground">
                      <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5">
                <p className="text-[12px] font-semibold text-foreground">What won't fit</p>
                <ul className="space-y-1">
                  {analysis.doesnt_fit_budget.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12.5px] text-muted-foreground">
                      <X className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {/* Paywall — sits at the bottom of the analysis card */}
          {project && (
            <PaywallCard projectId={project.id} sessionId={sessionId} />
          )}
        </div>

      </div>
    </div>
  )
}
