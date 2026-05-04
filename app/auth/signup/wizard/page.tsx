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
  siteType: 'existing' | ''
  projectType: 'residential' | ''
  scopeOfWork: 'extension' | 'renovation' | ''
  constructionPath: 'kitchen-reno' | 'bathroom-reno' | 'full-reno' | 'extension' | 'bedroom-reno' | 'multi-room' | ''
  homeType: string
  homeEra: string
  contingencyPct: number
  selectedPhases: string[]
  isProjectUnderway: boolean
  completedPhases: string[]
  city: string
  country: string
  currency: string
  quoteFile: File | null
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

function GeneratingStep({ projectName, error, onRetry }: { projectName: string; error: string | null; onRetry: () => void }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [doneSet, setDoneSet] = useState<Set<number>>(new Set())

  const items = [
    "Setting up your renovation plan",
    "Loading your phase checklist",
    "Setting up your budget tracker",
    "Getting your materials list ready",
    "Almost there",
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
        <h2 className="font-serif text-[22px] font-semibold text-foreground mb-1.5">
          {projectName ? `Setting up "${projectName}"` : 'Setting up your renovation'}
        </h2>
        <p className="text-[13px] text-muted-foreground">Just a moment.</p>
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
    id: 'kitchen', emoji: '🍳', title: 'Kitchen remodel', subtitle: 'Full or partial kitchen renovation',
    set: { siteType: 'existing' as const, projectType: 'residential' as const, scopeOfWork: 'renovation' as const, constructionPath: 'kitchen-reno' as const },
  },
  {
    id: 'bathroom', emoji: '🚿', title: 'Bathroom remodel', subtitle: 'Full or partial bathroom renovation',
    set: { siteType: 'existing' as const, projectType: 'residential' as const, scopeOfWork: 'renovation' as const, constructionPath: 'bathroom-reno' as const },
  },
  {
    id: 'full-reno', emoji: '🔨', title: 'Full home renovation', subtitle: 'Whole home or multiple floors',
    set: { siteType: 'existing' as const, projectType: 'residential' as const, scopeOfWork: 'renovation' as const, constructionPath: 'full-reno' as const },
  },
  {
    id: 'addition', emoji: '➕', title: 'Extension / Addition', subtitle: 'Expanding your home footprint',
    set: { siteType: 'existing' as const, projectType: 'residential' as const, scopeOfWork: 'extension' as const, constructionPath: 'extension' as const },
  },
  {
    id: 'bedroom', emoji: '🛏️', title: 'Bedroom / Living space', subtitle: 'Single-room renovation',
    set: { siteType: 'existing' as const, projectType: 'residential' as const, scopeOfWork: 'renovation' as const, constructionPath: 'bedroom-reno' as const },
  },
  {
    id: 'multi-room', emoji: '🏠', title: 'Multi-room renovation', subtitle: 'Several rooms being tackled together',
    set: { siteType: 'existing' as const, projectType: 'residential' as const, scopeOfWork: 'renovation' as const, constructionPath: 'multi-room' as const },
  },
]

const HOME_TYPES = [
  { id: 'house',     emoji: '🏡', title: 'House',              subtitle: 'Detached or semi-detached' },
  { id: 'apartment', emoji: '🏢', title: 'Apartment',          subtitle: 'Flat in a block or building' },
  { id: 'flat',      emoji: '🚪', title: 'Flat / Maisonette',  subtitle: 'Ground-floor or multi-level' },
  { id: 'townhouse', emoji: '🏘️', title: 'Townhouse',          subtitle: 'Multi-storey, terraced' },
  { id: 'period',    emoji: '🏛️', title: 'Period home',        subtitle: 'Victorian, Edwardian, Art Deco' },
  { id: 'heritage',  emoji: '🏰', title: 'Heritage / Listed',  subtitle: 'Special conditions may apply' },
]

const HOME_ERAS = [
  { id: 'pre-1950',     label: 'Built before 1950',  subtitle: 'Higher chance of asbestos, lead paint, old wiring' },
  { id: '1950-1980',    label: '1950 – 1980',         subtitle: 'Post-war build — artex, early cavity walls' },
  { id: '1980-2000',    label: '1980 – 2000',         subtitle: 'Modern services but variable insulation' },
  { id: '2000-present', label: '2000 onwards',        subtitle: 'Contemporary build standards' },
]

const CURRENCIES = [
  { code: 'USD', label: 'USD — US Dollar' },
  { code: 'CAD', label: 'CAD — Canadian Dollar' },
  { code: 'GBP', label: 'GBP — British Pound' },
  { code: 'AED', label: 'AED — UAE Dirham' },
  { code: 'SAR', label: 'SAR — Saudi Riyal' },
]

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', CAD: '$', GBP: '£', EUR: '€', AUD: '$', AED: 'د.إ', SAR: '﷼',
}

const PHASES_BY_PATH: Record<string, { id: string; title: string; desc: string }[]> = {
  'kitchen-reno': [
    { id: 'kitchen-reno-1', title: 'Planning & Permits',             desc: 'Drawings, approvals, contractor selection' },
    { id: 'kitchen-reno-2', title: 'Demolition & Strip-out',         desc: 'Remove existing units, services, finishes' },
    { id: 'kitchen-reno-3', title: 'Plumbing & Electrical Rough-ins', desc: 'First-fix trades before boarding' },
    { id: 'kitchen-reno-4', title: 'Fitting & Waterproofing',        desc: 'Unit install, splashback, sink, appliances' },
    { id: 'kitchen-reno-5', title: 'Finishing & Snag',               desc: 'Paint, hardware, commissioning, punch list' },
  ],
  'bathroom-reno': [
    { id: 'bathroom-reno-1', title: 'Planning & Permits',            desc: 'Drawings, wet-area regs, contractor quotes' },
    { id: 'bathroom-reno-2', title: 'Demolition & Strip-out',        desc: 'Remove fittings, tiles, screed, services' },
    { id: 'bathroom-reno-3', title: 'Waterproofing & Plumbing',      desc: 'Tanking membrane, first-fix plumbing' },
    { id: 'bathroom-reno-4', title: 'Tiling & Substrate',            desc: 'Wall/floor tiles, screed, heated floor' },
    { id: 'bathroom-reno-5', title: 'Fitting, Finishing & Snag',     desc: 'Sanitaryware, screens, fixtures, punch list' },
  ],
  'full-reno': [
    { id: 'full-reno-1', title: 'Discovery & Planning',              desc: 'Survey, hazmat checks, design, permits' },
    { id: 'full-reno-2', title: 'Demolition & Strip-out',            desc: 'Strip to shell; hazardous material removal' },
    { id: 'full-reno-3', title: 'Structural Work',                   desc: 'Beams, load-bearing changes, underpinning' },
    { id: 'full-reno-4', title: 'MEP Rough-ins',                     desc: 'Plumbing, electrical, mechanical first fix' },
    { id: 'full-reno-5', title: 'Insulation & Waterproofing',        desc: 'Thermal and moisture envelope' },
    { id: 'full-reno-6', title: 'Fix-out & Joinery',                 desc: 'Drywall, cabinetry, staircase, joinery' },
    { id: 'full-reno-7', title: 'Finishing, Snag & Closeout',        desc: 'Paint, floors, hardware, final sign-off' },
  ],
  'extension': [
    { id: 'extension-1', title: 'Planning & Permits',                desc: 'Permitted development / planning permission' },
    { id: 'extension-2', title: 'Groundworks & Foundation',          desc: 'Excavation, drainage diversion, slab / piles' },
    { id: 'extension-3', title: 'Structure & Weatherproofing',       desc: 'Frame, roof, windows to watertight stage' },
    { id: 'extension-4', title: 'MEP Rough-ins',                     desc: 'Services integration with existing structure' },
    { id: 'extension-5', title: 'Fix-out & Finishing',               desc: 'Insulation, drywall, joinery, decoration' },
    { id: 'extension-6', title: 'Integration & Snag',                desc: 'Opening up to main house, snagging, sign-off' },
  ],
  'bedroom-reno': [
    { id: 'bedroom-reno-1', title: 'Planning & Strip-out',           desc: 'Scope finalised, strip finishes' },
    { id: 'bedroom-reno-2', title: 'Structural & Rough-ins',         desc: 'Wall changes; electrical / data rough-in' },
    { id: 'bedroom-reno-3', title: 'Boarding & Insulation',          desc: 'Drywall, sound insulation, skimming' },
    { id: 'bedroom-reno-4', title: 'Finishing & Decoration',         desc: 'Flooring, paint, fitted furniture, hardware' },
  ],
  'multi-room': [
    { id: 'multi-room-1', title: 'Planning & Phasing Strategy',      desc: 'Sequence rooms to keep home liveable' },
    { id: 'multi-room-2', title: 'Demolition (by area)',             desc: 'Phased strip-out room by room' },
    { id: 'multi-room-3', title: 'Structural & MEP Rough-ins',       desc: 'Structural changes and first-fix trades' },
    { id: 'multi-room-4', title: 'Waterproofing & Substrate',        desc: 'Wet-area tanking, screed, boarding' },
    { id: 'multi-room-5', title: 'Fix-out & Joinery',                desc: 'Drywall, fitted furniture, stairs if applicable' },
    { id: 'multi-room-6', title: 'Finishing & Snag',                 desc: 'Decoration, floors, punch list, sign-off' },
  ],
}

const BUILD_LABELS: Record<string, string> = {
  'kitchen':    'kitchen remodel',
  'bathroom':   'bathroom remodel',
  'full-reno':  'full home renovation',
  'addition':   'extension / addition',
  'bedroom':    'bedroom / living space renovation',
  'multi-room': 'multi-room renovation',
}

function defaultContingency(buildType: string, homeEra: string): number {
  if (homeEra === 'pre-1950') return 25
  if (buildType === 'addition') return 25
  if (buildType === 'full-reno' || buildType === 'multi-room') return 20
  return 15
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
    siteType: (data.siteType as 'existing' | '') || '',
    projectType: (data.projectType as 'residential' | '') || '',
    scopeOfWork: (data.scopeOfWork as 'extension' | 'renovation' | '') || '',
    constructionPath: (data.constructionPath as ProjectData['constructionPath']) || '',
    homeType: data.homeType || '',
    homeEra: data.homeEra || '',
    contingencyPct: data.contingencyPct ?? 15,
    selectedPhases: data.selectedPhases || [],
    isProjectUnderway: data.isProjectUnderway || false,
    completedPhases: data.completedPhases || [],
    city: data.city || '',
    country: data.country || '',
    currency: data.currency || 'USD',
    quoteFile: null,
    hasDrawings: false,
    drawings: [],
    budget: data.budget || '',
    startDate: data.startDate || new Date().toISOString().split('T')[0],
    timeline: data.timeline || '6',
  })

  const upd = (updates: Partial<ProjectData>) => setPd(prev => ({ ...prev, ...updates }))
  const getPhases = () => PHASES_BY_PATH[pd.constructionPath] || []

  useEffect(() => {
    if (pd.constructionPath) {
      const phases = PHASES_BY_PATH[pd.constructionPath] || []
      upd({ selectedPhases: phases.map(p => p.id) })
    }
  }, [pd.constructionPath])

  useEffect(() => {
    upd({ contingencyPct: defaultContingency(pd.buildType, pd.homeEra) })
  }, [pd.buildType, pd.homeEra])

  useEffect(() => {
    if (step === 5) handleComplete()
  }, [step])

  const handleComplete = async () => {
    setError(null)
    try {
      const supabase = createSupabaseBrowserClient()
      const uploadedFiles: { path: string; name: string; fileType?: string }[] = []

      if (pd.hasDrawings && pd.drawings.length > 0) {
        for (const file of pd.drawings) {
          const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(`drawings/${safeName}`, file, { cacheControl: '3600', upsert: false })
          if (!uploadError && uploadData) uploadedFiles.push({ path: uploadData.path, name: file.name })
        }
      }

      if (pd.quoteFile) {
        const safeName = `${Date.now()}-${pd.quoteFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(`quotes/${safeName}`, pd.quoteFile, { cacheControl: '3600', upsert: false })
        if (!uploadError && uploadData) {
          uploadedFiles.push({ path: uploadData.path, name: pd.quoteFile.name, fileType: 'invoice' })
        }
      }

      const { drawings: _f, quoteFile: _q, ...serializable } = pd
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

  // ── Derived ───────────────────────────────────────────────────────────────

  const budgetNum = parseFloat(pd.budget.replace(/,/g, '')) || 0
  const reserve = Math.round(budgetNum * pd.contingencyPct / 100)
  const workingBudget = budgetNum - reserve
  const currencySymbol = CURRENCY_SYMBOLS[pd.currency] || '$'

  // ── Validation ────────────────────────────────────────────────────────────

  const valid = [
    !!pd.buildType && pd.projectName.trim().length > 0,
    !!pd.homeType && !!pd.homeEra && pd.city.trim().length > 0 && pd.country.trim().length > 0,
    true,
    !!pd.budget && !!pd.startDate,
    true,
  ]

  // ── Step definitions ──────────────────────────────────────────────────────

  const steps = [
    {
      label: 'Step 1 of 5',
      title: 'What are you renovating?',
      subtitle: "We'll set up your renovation plan, budget tracker, and timeline automatically.",
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
                placeholder='e.g. "Our kitchen" or "Master bathroom 2025"'
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
      title: 'Tell us about your home',
      subtitle: 'This helps us tailor your renovation plan and flag anything to watch out for.',
      content: (
        <div className="space-y-4">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-2">
              What type of home is it?
            </p>
            <div className="grid grid-cols-3 gap-2">
              {HOME_TYPES.map(ht => (
                <OptionCard
                  key={ht.id}
                  emoji={ht.emoji}
                  title={ht.title}
                  subtitle={ht.subtitle}
                  selected={pd.homeType === ht.id}
                  onClick={() => upd({ homeType: ht.id })}
                  small
                />
              ))}
            </div>
          </div>
          {pd.homeType && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-2">
                Roughly when was it built?
              </p>
              <div className="grid grid-cols-2 gap-2">
                {HOME_ERAS.map(era => (
                  <button
                    key={era.id}
                    type="button"
                    onClick={() => upd({ homeEra: era.id })}
                    className={cn(
                      "w-full text-left p-3 rounded-[12px] border-[1.5px] transition-all",
                      pd.homeEra === era.id
                        ? "border-primary bg-[hsl(var(--brand-soft))] shadow-[0_0_0_3px_hsl(var(--primary)/0.08)]"
                        : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                    )}
                  >
                    <p className="text-[12px] font-semibold text-foreground">{era.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{era.subtitle}</p>
                  </button>
                ))}
              </div>
              {pd.homeEra === 'pre-1950' && (
                <div className="mt-3">
                  <WizardNote>
                    Older homes often hide surprises — asbestos, lead paint, or outdated wiring. We've set your contingency reserve higher to account for this.
                  </WizardNote>
                </div>
              )}
            </div>
          )}
          {pd.homeEra && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">Your city</label>
                <Input
                  placeholder="e.g. London"
                  value={pd.city}
                  onChange={e => upd({ city: e.target.value })}
                  className="bg-muted border-border focus:border-primary text-[13px]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">Country</label>
                <Input
                  placeholder="e.g. UK"
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
      subtitle: "You can join mid-renovation — we'll catch up to where you are.",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2.5">
            <OptionCard
              emoji="🌱"
              title="Just starting out"
              subtitle="Planning or about to begin demo"
              selected={!pd.isProjectUnderway}
              onClick={() => upd({ isProjectUnderway: false, completedPhases: [] })}
            />
            <OptionCard
              emoji="🔧"
              title="Already in progress"
              subtitle="Work has already started"
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
                  Which phases are done?
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
      title: "What's your budget?",
      subtitle: 'Be honest here — we help you protect a contingency reserve for the surprises.',
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

          {budgetNum > 0 && (
            <div className="rounded-[12px] bg-muted p-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold text-foreground">Contingency reserve</p>
                  <p className="text-[11px] text-muted-foreground">Set aside for unexpected costs</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <input
                    type="number" min="0" max="50" step="1"
                    value={pd.contingencyPct}
                    onChange={e => upd({ contingencyPct: Math.min(50, Math.max(0, parseInt(e.target.value) || 0)) })}
                    className="w-12 bg-background border border-border rounded-lg px-2 py-1 text-[13px] text-center font-mono focus:outline-none focus:border-primary"
                  />
                  <span className="text-[12px] text-muted-foreground">%</span>
                  <span className="text-[12px] font-mono text-muted-foreground">=</span>
                  <span className="text-[12px] font-mono font-semibold text-foreground">
                    {currencySymbol}{reserve.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-muted-foreground">Working budget</span>
                <span className="text-[14px] font-semibold font-mono text-foreground">
                  {currencySymbol}{workingBudget.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          <WizardNote>
            Renovations typically run 10–25% over initial estimates. Your contingency reserve stays protected and only gets used when something unexpected comes up.
          </WizardNote>

          <div className="h-px bg-border" />

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">When do you plan to start?</label>
            <Input
              type="date"
              value={pd.startDate}
              onChange={e => upd({ startDate: e.target.value })}
              className="bg-muted border-border focus:border-primary text-[13px]"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">How long do you expect it to take?</label>
            <input
              type="range" min="1" max="12" step="1"
              value={pd.timeline}
              onChange={e => upd({ timeline: e.target.value })}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5">
              <span>1 month</span>
              <span className="font-semibold text-foreground">
                {pd.timeline} month{parseInt(pd.timeline) !== 1 ? 's' : ''}
              </span>
              <span>12 months</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'Step 5 of 5',
      title: "Got a quote? Let’s check it.",
      subtitle: "Drop a contractor quote below and we'll flag any line items that look above market rate. Completely optional — you can do this from your dashboard anytime.",
      content: (
        <div className="space-y-4">
          <label className={cn(
            "block w-full rounded-[14px] border-[2px] border-dashed cursor-pointer transition-all text-center py-8 px-4",
            pd.quoteFile
              ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          )}>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.heic,.webp"
              className="sr-only"
              onChange={e => upd({ quoteFile: e.target.files?.[0] || null })}
            />
            {pd.quoteFile ? (
              <div className="space-y-2">
                <div className="text-2xl">📄</div>
                <p className="text-[13px] font-semibold text-foreground">{pd.quoteFile.name}</p>
                <p className="text-[11px] text-emerald-600 font-medium">Ready to analyse ✓</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-2xl text-muted-foreground">📂</div>
                <p className="text-[13px] font-medium text-foreground">Click to upload a contractor quote</p>
                <p className="text-[11px] text-muted-foreground">PDF or image · your data stays private</p>
              </div>
            )}
          </label>
          {pd.quoteFile && (
            <button
              type="button"
              onClick={() => upd({ quoteFile: null })}
              className="text-[11px] text-muted-foreground hover:text-foreground underline block"
            >
              Remove file
            </button>
          )}
          <WizardNote>
            We compare each line item against current rates for your area — labour, tiling, plastering, electrical, and more. Most overcharging happens on labour rates.
          </WizardNote>

          <div className="bg-muted rounded-[12px] p-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.06em] mb-3">
              Your renovation plan
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

          {budgetNum > 0 && (
            <div className="flex items-center justify-between rounded-[10px] bg-[hsl(var(--brand-soft))] border border-primary/15 px-3.5 py-2.5">
              <p className="text-[11.5px] text-foreground/80">
                {pd.contingencyPct}% contingency reserve locked in
              </p>
              <p className="text-[12px] font-semibold font-mono text-foreground">
                Working budget {currencySymbol}{workingBudget.toLocaleString()}
              </p>
            </div>
          )}
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
            projectName={pd.projectName}
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
                {step < 4 ? <>Continue <ChevronRight size={14} /></> : <>Build my renovation <ChevronRight size={14} /></>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
