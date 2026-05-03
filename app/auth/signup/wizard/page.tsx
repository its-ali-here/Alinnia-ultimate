"use client"

import React, { useState, useEffect } from 'react'
import { useOnboarding } from "@/contexts/onboarding-context"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectData {
  buildType: string
  projectName: string
  siteType: 'empty' | 'existing' | ''
  projectType: 'residential' | 'commercial' | ''
  scopeOfWork: 'construction' | 'extension' | 'renovation' | ''
  constructionPath: 'masonry' | 'timber' | 'precision' | ''
  displayMethod: string
  selectedPhases: string[]
  isProjectUnderway: boolean
  completedPhases: string[]
  hasBasement: boolean
  city: string
  country: string
  currency: string
  area: string
  floors: string
  hasDrawings: boolean
  drawings: File[]
  budget: string
  startDate: string
  timeline: string
}

// ─── Option card ──────────────────────────────────────────────────────────────

function OptionCard({
  emoji,
  title,
  subtitle,
  selected,
  onClick,
  small,
}: {
  emoji: string
  title: string
  subtitle: string
  selected: boolean
  onClick: () => void
  small?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 rounded-[14px] border-[1.5px] cursor-pointer transition-all text-left",
        small ? "p-3" : "p-4",
        selected
          ? "border-primary bg-[hsl(var(--brand-soft))] shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
          : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
      )}
    >
      <div className={cn(
        "rounded-[9px] flex items-center justify-center flex-shrink-0",
        small ? "w-8 h-8 text-base" : "w-10 h-10 text-xl",
        selected ? "bg-primary/10" : "bg-muted"
      )}>
        {emoji}
      </div>
      <div>
        <div className={cn("font-semibold text-foreground", small ? "text-[12px]" : "text-[13px]")}>
          {title}
        </div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</div>
      </div>
    </button>
  )
}

// ─── Info note ────────────────────────────────────────────────────────────────

function WizardNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2.5 items-start rounded-[10px] bg-[hsl(var(--brand-soft))] border border-primary/15 px-3.5 py-2.5 text-[11.5px] text-foreground/80 leading-relaxed">
      <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="6" stroke="hsl(var(--primary))" strokeWidth="1.3" />
        <path d="M7 4.5V7.5M7 9.5V10" stroke="hsl(var(--primary))" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <span>{children}</span>
    </div>
  )
}

// ─── Generating step ──────────────────────────────────────────────────────────

function GeneratingStep({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [doneSet, setDoneSet] = useState<Set<number>>(new Set())

  const items = [
    "Creating your project phases",
    "Loading punch list templates",
    "Setting material categories",
    "Calculating procurement timelines",
    "Configuring your dashboard",
  ]

  useEffect(() => {
    if (error || activeIdx >= items.length) return
    const timer = setTimeout(() => {
      setDoneSet(prev => new Set(Array.from(prev).concat(activeIdx)))
      setActiveIdx(prev => prev + 1)
    }, 650)
    return () => clearTimeout(timer)
  }, [activeIdx, error])

  if (error) {
    return (
      <div className="px-8 py-14 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="font-serif text-[22px] font-semibold text-foreground mb-2">Something went wrong</h2>
        <p className="text-[13px] text-destructive mb-6">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="px-6 py-2.5 rounded-[10px] text-[13px] font-semibold bg-primary text-primary-foreground shadow-[0_2px_8px_hsl(var(--primary)/0.3)] hover:opacity-90 transition-all"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="px-8 py-12">
      <div className="text-center mb-8">
        <div className="w-11 h-11 border-[3px] border-[hsl(var(--brand-soft))] border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <h2 className="font-serif text-[22px] font-semibold text-foreground mb-1.5">Building your project</h2>
        <p className="text-[13px] text-muted-foreground">Just a moment while we set everything up.</p>
      </div>
      <div className="space-y-3 max-w-[260px] mx-auto">
        {items.map((item, i) => {
          const done = doneSet.has(i)
          const active = i === activeIdx
          return (
            <div
              key={i}
              className={cn(
                "flex items-center gap-3 text-[12px] transition-colors",
                done ? "text-emerald-600" : active ? "text-foreground" : "text-muted-foreground/50"
              )}
            >
              <div className={cn(
                "w-2 h-2 rounded-full flex-shrink-0 transition-colors",
                done ? "bg-emerald-500" : active ? "bg-primary animate-pulse" : "bg-muted"
              )} />
              {item}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const BUILD_TYPES = [
  {
    id: 'new-build', emoji: '🏗️', title: 'New home build', subtitle: 'Ground-up construction',
    set: { siteType: 'empty' as const, projectType: 'residential' as const, scopeOfWork: 'construction' as const },
  },
  {
    id: 'kitchen', emoji: '🍳', title: 'Kitchen renovation', subtitle: 'Full or partial remodel',
    set: { siteType: 'existing' as const, projectType: 'residential' as const, scopeOfWork: 'renovation' as const },
  },
  {
    id: 'bathroom', emoji: '🚿', title: 'Bathroom renovation', subtitle: 'Full or partial remodel',
    set: { siteType: 'existing' as const, projectType: 'residential' as const, scopeOfWork: 'renovation' as const },
  },
  {
    id: 'addition', emoji: '➕', title: 'Addition / extension', subtitle: 'Expanding the structure',
    set: { siteType: 'existing' as const, projectType: 'residential' as const, scopeOfWork: 'extension' as const },
  },
  {
    id: 'full-reno', emoji: '🔨', title: 'Full renovation', subtitle: 'Whole home or floor',
    set: { siteType: 'existing' as const, projectType: 'residential' as const, scopeOfWork: 'renovation' as const },
  },
  {
    id: 'commercial', emoji: '🏢', title: 'Commercial project', subtitle: 'Office, retail, or mixed use',
    set: { siteType: 'existing' as const, projectType: 'commercial' as const, scopeOfWork: 'renovation' as const },
  },
]

const METHODS = [
  { id: 'timber', emoji: '🪵', title: 'Timber & light frame', subtitle: 'US, Canada, UK, Australia' },
  { id: 'masonry', emoji: '🧱', title: 'Masonry & RCC', subtitle: 'Middle East, S. Europe, Mediterranean' },
  { id: 'precision', emoji: '⚙️', title: 'Steel / precision', subtitle: 'Germany, Scandinavia, N. Europe' },
  { id: 'mixed', emoji: '🔀', title: 'Mixed / not sure', subtitle: "We'll use a general template" },
]

const CURRENCIES = [
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'CAD', label: 'CAD — Canadian Dollar' },
  { code: 'GBP', label: 'GBP — British Pound' },
  { code: 'EUR', label: 'EUR — Euro' },
]

const PHASES_BY_PATH: Record<string, { id: string; title: string; desc: string }[]> = {
  masonry: [
    { id: 'masonry-1', title: 'Pre-Construction', desc: 'Permits & Excavation' },
    { id: 'masonry-2', title: 'Substructure', desc: 'Foundation & Plinth' },
    { id: 'masonry-3', title: 'Grey Structure', desc: 'Pillars, Walls & Roof Slab' },
    { id: 'masonry-4', title: 'MEP Rough-ins', desc: 'Piping & Wiring in walls' },
    { id: 'masonry-5', title: 'Finishing', desc: 'Plaster, Paint & Tile' },
  ],
  timber: [
    { id: 'timber-1', title: 'Pre-Construction', desc: 'Permits & Site Prep' },
    { id: 'timber-2', title: 'Foundation', desc: 'Slab, Crawlspace, or Pier' },
    { id: 'timber-3', title: 'Framing', desc: 'Studs, Rafters & Roof' },
    { id: 'timber-4', title: 'Rough-ins', desc: 'Plumbing & Electrical before Drywall' },
    { id: 'timber-5', title: 'Fix-out / Handover', desc: 'Drywall, Trim & Paint' },
  ],
  precision: [
    { id: 'precision-1', title: 'Design & Planning', desc: 'Detailed CAD / Specs' },
    { id: 'precision-2', title: 'Groundworks', desc: 'Foundations & Utilities' },
    { id: 'precision-3', title: 'Assembly', desc: 'Panel / Module Installation' },
    { id: 'precision-4', title: 'Service Integration', desc: 'System hookups' },
    { id: 'precision-5', title: 'Interior Fit-out', desc: 'Final Finishing' },
  ],
}

const BUILD_LABELS: Record<string, string> = {
  'new-build': 'new home build',
  'kitchen': 'kitchen renovation',
  'bathroom': 'bathroom renovation',
  'addition': 'addition / extension',
  'full-reno': 'full renovation',
  'commercial': 'commercial project',
}

const METHOD_LABELS: Record<string, string> = {
  masonry: 'masonry & RCC',
  timber: 'timber & light frame',
  precision: 'steel & precision',
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProjectWizardPage() {
  const { updateData, data } = useOnboarding()
  const router = useRouter()

  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const [pd, setPd] = useState<ProjectData>({
    buildType: data.buildType || '',
    projectName: data.projectName || '',
    siteType: data.siteType || '',
    projectType: data.projectType || '',
    scopeOfWork: data.scopeOfWork || '',
    constructionPath: data.constructionPath || '',
    displayMethod: data.constructionPath || '',
    selectedPhases: data.selectedPhases || [],
    isProjectUnderway: data.isProjectUnderway || false,
    completedPhases: data.completedPhases || [],
    hasBasement: data.hasBasement || false,
    city: data.city || '',
    country: data.country || '',
    currency: data.currency || 'USD',
    area: data.area || '',
    floors: data.floors || '1',
    hasDrawings: false,
    drawings: [],
    budget: data.budget || '',
    startDate: data.startDate || new Date().toISOString().split('T')[0],
    timeline: data.timeline || '6',
  })

  const upd = (updates: Partial<ProjectData>) => setPd(prev => ({ ...prev, ...updates }))
  const getPhases = () => PHASES_BY_PATH[pd.constructionPath] || PHASES_BY_PATH.timber

  useEffect(() => {
    if (pd.constructionPath) {
      const phases = PHASES_BY_PATH[pd.constructionPath] || []
      upd({ selectedPhases: phases.map(p => p.id) })
    }
  }, [pd.constructionPath])

  useEffect(() => {
    if (step === 5) handleComplete()
  }, [step])

  const handleComplete = async () => {
    setError(null)
    try {
      const uploadedFiles: { path: string; name: string }[] = []
      if (pd.hasDrawings && pd.drawings.length > 0) {
        const supabase = createSupabaseBrowserClient()
        for (const file of pd.drawings) {
          const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(`drawings/${safeName}`, file, { cacheControl: '3600', upsert: false })
          if (!uploadError && uploadData) uploadedFiles.push({ path: uploadData.path, name: file.name })
        }
      }

      const { drawings: _f, displayMethod: _dm, ...serializable } = pd
      updateData({ ...serializable })

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...serializable, uploadedFiles }),
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.message || 'Something went wrong')
      }

      updateData({ projectName: pd.projectName })
      router.push('/auth/signup/setup')
    } catch (err: any) {
      setError(err.message)
    }
  }

  // ── Validation ────────────────────────────────────────────────────────────

  const valid = [
    !!pd.buildType && pd.projectName.trim().length > 0,
    !!pd.constructionPath && pd.city.trim().length > 0 && pd.country.trim().length > 0,
    true,
    !!pd.budget && !!pd.startDate,
    true,
  ]

  // ── Step definitions ──────────────────────────────────────────────────────

  const steps = [
    {
      label: 'Step 1 of 5',
      title: 'What are you building?',
      subtitle: "We'll set up your phases, materials, and timeline automatically.",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5">
            {BUILD_TYPES.map(bt => (
              <OptionCard
                key={bt.id}
                emoji={bt.emoji}
                title={bt.title}
                subtitle={bt.subtitle}
                selected={pd.buildType === bt.id}
                onClick={() => upd({ buildType: bt.id, ...bt.set })}
              />
            ))}
          </div>
          {pd.buildType && (
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">
                Give it a name
              </label>
              <Input
                placeholder='e.g. "Our forever home" or "Kitchen remodel 2025"'
                value={pd.projectName}
                onChange={e => upd({ projectName: e.target.value })}
                className="bg-muted border-border focus:border-primary text-[13px]"
                autoFocus
              />
            </div>
          )}
        </div>
      ),
    },
    {
      label: 'Step 2 of 5',
      title: 'How is it being built?',
      subtitle: 'This determines your phase sequence and the materials we track.',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5">
            {METHODS.map(m => (
              <OptionCard
                key={m.id}
                emoji={m.emoji}
                title={m.title}
                subtitle={m.subtitle}
                selected={pd.displayMethod === m.id}
                onClick={() => upd({
                  displayMethod: m.id,
                  constructionPath: m.id === 'mixed' ? 'masonry' : m.id as 'masonry' | 'timber' | 'precision',
                })}
                small
              />
            ))}
          </div>
          {pd.constructionPath && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">City</label>
                <Input
                  placeholder="e.g. Dubai"
                  value={pd.city}
                  onChange={e => upd({ city: e.target.value })}
                  className="bg-muted border-border focus:border-primary text-[13px]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">Country</label>
                <Input
                  placeholder="e.g. UAE"
                  value={pd.country}
                  onChange={e => upd({ country: e.target.value })}
                  className="bg-muted border-border focus:border-primary text-[13px]"
                />
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      label: 'Step 3 of 5',
      title: 'Where are you in the project?',
      subtitle: "You can join mid-project — we'll catch up to where you are.",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5">
            <OptionCard
              emoji="🌱"
              title="Just starting out"
              subtitle="Planning or about to break ground"
              selected={!pd.isProjectUnderway}
              onClick={() => upd({ isProjectUnderway: false, completedPhases: [] })}
            />
            <OptionCard
              emoji="🔧"
              title="Already in progress"
              subtitle="Project has already begun"
              selected={pd.isProjectUnderway}
              onClick={() => upd({ isProjectUnderway: true })}
            />
          </div>
          {pd.isProjectUnderway && (
            <div className="space-y-3">
              <WizardNote>
                No worries — we'll mark earlier phases as complete and start tracking from where you are now.
              </WizardNote>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-2">
                  Mark phases already done
                </p>
                <div className="space-y-1.5">
                  {getPhases().map(phase => {
                    const done = pd.completedPhases.includes(phase.id)
                    return (
                      <button
                        key={phase.id}
                        type="button"
                        onClick={() => {
                          const updated = done
                            ? pd.completedPhases.filter(id => id !== phase.id)
                            : [...pd.completedPhases, phase.id]
                          upd({ completedPhases: updated })
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-[10px] border-[1.5px] text-left transition-all",
                          done
                            ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full border-[2px] flex items-center justify-center flex-shrink-0 transition-all",
                          done ? "border-emerald-500 bg-emerald-500" : "border-muted-foreground/30"
                        )}>
                          {done && <Check size={11} className="text-white" strokeWidth={3} />}
                        </div>
                        <div>
                          <div className={cn(
                            "text-[12px] font-medium",
                            done ? "line-through text-muted-foreground" : "text-foreground"
                          )}>
                            {phase.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground">{phase.desc}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      label: 'Step 4 of 5',
      title: 'Budget & timeline',
      subtitle: 'Set your total budget and expected project duration.',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">Total budget</label>
              <Input
                placeholder="e.g. 55,000"
                value={pd.budget}
                onChange={e => upd({ budget: e.target.value })}
                className="bg-muted border-border focus:border-primary text-[13px]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">Currency</label>
              <select
                value={pd.currency}
                onChange={e => upd({ currency: e.target.value })}
                className="w-full bg-muted border-[1.5px] border-border rounded-[10px] px-3 py-[9px] text-[13px] text-foreground font-sans outline-none focus:border-primary transition-colors"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="h-px bg-border" />
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">Project start date</label>
            <Input
              type="date"
              value={pd.startDate}
              onChange={e => upd({ startDate: e.target.value })}
              className="bg-muted border-border focus:border-primary text-[13px]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">Expected timeline</label>
            <input
              type="range" min="1" max="36" step="1"
              value={pd.timeline}
              onChange={e => upd({ timeline: e.target.value })}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5">
              <span>1 month</span>
              <span className="font-semibold text-foreground">
                {pd.timeline} month{parseInt(pd.timeline) !== 1 ? 's' : ''}
              </span>
              <span>36 months</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'Step 5 of 5',
      title: "Here's your project plan",
      subtitle: `Based on your ${BUILD_LABELS[pd.buildType] || 'project'} using ${METHOD_LABELS[pd.constructionPath] || 'general'} construction. You can edit everything after.`,
      content: (
        <div className="space-y-3">
          <div className="bg-muted rounded-[12px] p-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.06em] mb-3">
              Auto-generated phases
            </p>
            <div>
              {getPhases().map((phase, i) => (
                <div
                  key={phase.id}
                  className="flex items-center gap-3 py-2.5 border-b border-border/50 last:border-0 last:pb-0"
                >
                  <div className="w-[20px] h-[20px] rounded-full bg-card border border-border flex items-center justify-center text-[10px] font-semibold text-muted-foreground flex-shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <div className="text-[12px] font-medium text-foreground">{phase.title}</div>
                    <div className="text-[11px] text-muted-foreground">{phase.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-[10px] bg-[hsl(var(--brand-soft))] border border-primary/15 px-3.5 py-2.5">
            <span className="text-base leading-none mt-0.5">✨</span>
            <p className="text-[11.5px] text-foreground/80 leading-relaxed">
              Also ready for you: punch list templates, material categories, and procurement timing reminders for long lead-time items.
            </p>
          </div>
        </div>
      ),
    },
  ]

  // ── Render ─────────────────────────────────────────────────────────────────

  const progressPct = step >= 5 ? 100 : Math.round(((step + 1) / 5) * 100)
  const isGenerating = step === 5

  return (
    <div className="w-full max-w-[520px] px-4 py-6">
      {/* Top progress bar */}
      <div className="h-[3px] bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)]"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Card */}
      <div className="bg-card rounded-[18px] shadow-[0_8px_40px_rgba(28,25,23,0.10),0_2px_8px_rgba(28,25,23,0.05)] overflow-hidden">

        {isGenerating ? (
          <GeneratingStep
            error={error}
            onRetry={() => {
              setError(null)
              setStep(4)
            }}
          />
        ) : (
          <>
            {/* Header */}
            <div className="px-8 pt-8 pb-0 text-center">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-2">
                {steps[step].label}
              </div>
              <h1 className="font-serif text-[26px] font-semibold text-foreground leading-tight mb-2">
                {steps[step].title}
              </h1>
              <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[340px] mx-auto">
                {steps[step].subtitle}
              </p>
            </div>

            {/* Body */}
            <div className="px-8 py-6">
              {steps[step].content}
            </div>

            {/* Footer */}
            <div className="px-8 pb-8 flex items-center justify-between">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft size={14} />
                  Back
                </button>
              ) : <div />}

              <button
                type="button"
                disabled={!valid[step]}
                onClick={() => setStep(s => s + 1)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all",
                  valid[step]
                    ? "bg-primary text-primary-foreground shadow-[0_2px_8px_hsl(var(--primary)/0.3)] hover:opacity-90 hover:-translate-y-px active:translate-y-0"
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                {step < 4 ? <>Continue <ChevronRight size={14} /></> : <>Looks good — build it <ChevronRight size={14} /></>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
