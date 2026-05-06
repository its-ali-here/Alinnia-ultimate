"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Upload, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from "@/components/ui/input"
import Image from "next/image"

// ─── Types ────────────────────────────────────────────────────────────────────

type RoomType =
  | 'bathroom' | 'kitchen' | 'bedroom' | 'living-room'
  | 'outdoor' | 'full-home' | 'extension' | 'multi-room'

interface ProjectData {
  roomType: RoomType | ''
  projectName: string
  homeType: string
  currentPhotos: File[]
  inspirationPhotos: File[]
  lengthFt: string
  widthFt: string
  heightFt: string
  inspirationText: string
  budget: string
  currency: string
  state: string
  city: string
}

// ─── Option card ──────────────────────────────────────────────────────────────

function OptionCard({
  emoji, title, subtitle, selected, onClick, small,
}: {
  emoji: string; title: string; subtitle: string
  selected: boolean; onClick: () => void; small?: boolean
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

// ─── Image drop zone ──────────────────────────────────────────────────────────

function ImageDropZone({
  label, hint, files, onChange, maxFiles = 3,
}: {
  label: string; hint: string; files: File[]
  onChange: (files: File[]) => void; maxFiles?: number
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return
    const valid = Array.from(newFiles).filter(f => f.type.startsWith("image/"))
    onChange([...files, ...valid].slice(0, maxFiles))
  }, [files, maxFiles, onChange])

  return (
    <div className="space-y-2">
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em]">{label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>
      </div>

      {files.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {files.map((f, i) => {
            const url = URL.createObjectURL(f)
            return (
              <div key={i} className="relative w-20 h-20 rounded-[10px] overflow-hidden border border-border flex-shrink-0">
                <Image src={url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => onChange(files.filter((_, j) => j !== i))}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {files.length < maxFiles && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
          className={cn(
            "w-full border-[1.5px] border-dashed rounded-[12px] py-5 flex flex-col items-center gap-1.5 transition-colors",
            dragging
              ? "border-primary bg-[hsl(var(--brand-soft))]"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          )}
        >
          <Upload className="w-4 h-4 text-muted-foreground" />
          <span className="text-[12px] text-muted-foreground">
            {files.length === 0 ? "Click or drag to upload" : "Add another"}
          </span>
        </button>
      )}

      <input
        ref={inputRef} type="file" accept="image/*"
        multiple={maxFiles > 1} className="hidden"
        onChange={e => addFiles(e.target.files)}
      />
    </div>
  )
}

// ─── Analysing step ───────────────────────────────────────────────────────────

function AnalysingStep({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [doneSet, setDoneSet] = useState<Set<number>>(new Set())

  const items = [
    "Uploading your photos",
    "Reading your space",
    "Checking local material costs",
    "Calculating what fits your budget",
    "Building your analysis",
  ]

  useEffect(() => {
    if (error || activeIdx >= items.length) return
    const timer = setTimeout(() => {
      setDoneSet(prev => new Set(Array.from(prev).concat(activeIdx)))
      setActiveIdx(prev => prev + 1)
    }, 800)
    return () => clearTimeout(timer)
  }, [activeIdx, error, items.length])

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
        <h2 className="font-serif text-[22px] font-semibold text-foreground mb-1.5">Analysing your space…</h2>
        <p className="text-[13px] text-muted-foreground">Usually takes 10–20 seconds.</p>
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

const ROOM_TYPES: { id: RoomType; emoji: string; title: string; subtitle: string }[] = [
  { id: 'bathroom',    emoji: '🛁', title: 'Bathroom',        subtitle: 'Shower, tiling, vanity, fixtures' },
  { id: 'kitchen',     emoji: '🍳', title: 'Kitchen',         subtitle: 'Cabinets, countertops, appliances' },
  { id: 'bedroom',     emoji: '🛏️', title: 'Bedroom',         subtitle: 'Layout, flooring, closets' },
  { id: 'living-room', emoji: '🛋️', title: 'Living Room',     subtitle: 'Open plan, flooring, fireplace' },
  { id: 'full-home',   emoji: '🏠', title: 'Full Home',       subtitle: 'Whole-house renovation' },
  { id: 'extension',   emoji: '🏗️', title: 'Extension',       subtitle: 'Adding square footage' },
  { id: 'outdoor',     emoji: '🌿', title: 'Outdoor / Patio', subtitle: 'Deck, landscaping, pool' },
  { id: 'multi-room',  emoji: '🔑', title: 'Multiple Rooms',  subtitle: 'Two or more spaces' },
]

const HOME_TYPES = [
  { id: 'house',     emoji: '🏡', title: 'House',       subtitle: 'Detached or semi-detached' },
  { id: 'apartment', emoji: '🏢', title: 'Apartment',   subtitle: 'Unit in a block or high-rise' },
  { id: 'townhouse', emoji: '🏘️', title: 'Townhouse',   subtitle: 'Multi-storey, terraced' },
  { id: 'condo',     emoji: '🚪', title: 'Condo',       subtitle: 'Condominium unit' },
]

const UK_COUNTRIES = ['England', 'Scotland', 'Wales', 'Northern Ireland']

// ─── Main wizard ──────────────────────────────────────────────────────────────

export default function ProjectWizardPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const [pd, setPd] = useState<ProjectData>({
    roomType: '',
    projectName: '',
    homeType: '',
    currentPhotos: [],
    inspirationPhotos: [],
    lengthFt: '',
    widthFt: '',
    heightFt: '',
    inspirationText: '',
    budget: '',
    currency: 'GBP',
    state: '',
    city: '',
  })

  const upd = (updates: Partial<ProjectData>) => setPd(prev => ({ ...prev, ...updates }))

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    setError(null)
    try {
      const uploadImage = async (file: File, imageType: "current" | "inspiration") => {
        const fd = new FormData()
        fd.append("file", file)
        fd.append("image_type", imageType)
        const res = await fetch("/api/images/upload", { method: "POST", body: fd })
        if (!res.ok) throw new Error("Image upload failed")
        return (await res.json()).path as string
      }

      const [currentPaths, inspirationPaths] = await Promise.all([
        Promise.all(pd.currentPhotos.map(f => uploadImage(f, "current"))),
        Promise.all(pd.inspirationPhotos.map(f => uploadImage(f, "inspiration"))),
      ])

      const lengthM = parseFloat(pd.lengthFt) || 0
      const widthM  = parseFloat(pd.widthFt)  || 0
      const heightM = parseFloat(pd.heightFt) || 0
      const floorAreaSqm = lengthM > 0 && widthM > 0 ? Math.round(lengthM * widthM * 10) / 10 : undefined

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomType: pd.roomType,
          budget: Number(pd.budget.replace(/,/g, '')),
          state: pd.state,
          city: pd.city,
          inspirationText: pd.inspirationText || undefined,
          currentImagePaths: currentPaths,
          inspirationImagePaths: inspirationPaths,
          measurements: { lengthFt: lengthM, widthFt: widthM, heightFt: heightM, floorAreaSqft: floorAreaSqm },
          homeType: pd.homeType || undefined,
          currency: pd.currency,
          projectName: pd.projectName || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Analysis failed")
      }

      const { sessionId } = await res.json()
      router.push(`/results/${sessionId}`)
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    }
  }, [pd, router])

  useEffect(() => {
    if (step === 5) handleSubmit()
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived ────────────────────────────────────────────────────────────────

  const lengthM = parseFloat(pd.lengthFt) || 0
  const widthM  = parseFloat(pd.widthFt)  || 0
  const heightM = parseFloat(pd.heightFt) || 0
  const floorAreaSqm = lengthM > 0 && widthM > 0 ? Math.round(lengthM * widthM * 10) / 10 : null
  const wallAreaSqm  = (lengthM > 0 && widthM > 0 && heightM > 0)
    ? Math.round(2 * (lengthM + widthM) * heightM * 10) / 10
    : null

  const budgetNum = parseFloat(pd.budget.replace(/,/g, '')) || 0
  const currencySymbol = '£'

  // ── Validation ─────────────────────────────────────────────────────────────

  const valid = [
    // Step 0 — room type required; name optional
    !!pd.roomType,
    // Step 1 — at least one current photo
    pd.currentPhotos.length > 0,
    // Step 2 — all three measurements
    pd.lengthFt !== '' && pd.widthFt !== '' && pd.heightFt !== '',
    // Step 3 — budget + state + city
    pd.budget !== '' && budgetNum >= 1000 && pd.state !== '' && pd.city.trim().length > 0,
    // Step 4 — review (always valid)
    true,
  ]

  // ── Step content ───────────────────────────────────────────────────────────

  const STEP_META = [
    {
      label: 'Step 1 of 5',
      title: 'What are you remodeling?',
      subtitle: "Pick the space and give your project a name — we'll tailor everything to it.",
    },
    {
      label: 'Step 2 of 5',
      title: 'Show us your space',
      subtitle: 'Upload a photo of how it looks today, and one of the look you want to achieve.',
    },
    {
      label: 'Step 3 of 5',
      title: 'Measure your space',
      subtitle: 'A quick measurement helps us calculate materials and costs accurately.',
    },
    {
      label: 'Step 4 of 5',
      title: "What's your budget?",
      subtitle: 'Be honest — we figure out exactly how much of your goal is achievable in your area.',
    },
    {
      label: 'Step 5 of 5',
      title: 'Review and analyse',
      subtitle: "Looks good — here's what we'll analyse. Hit the button when you're ready.",
    },
  ]

  const renderStep = () => {
    switch (step) {
      // ── Step 0: Room type ────────────────────────────────────────────────
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2.5">
              {ROOM_TYPES.map(rt => (
                <OptionCard
                  key={rt.id}
                  emoji={rt.emoji}
                  title={rt.title}
                  subtitle={rt.subtitle}
                  selected={pd.roomType === rt.id}
                  onClick={() => upd({ roomType: rt.id })}
                />
              ))}
            </div>
            {pd.roomType && (
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">
                  Give it a name <span className="normal-case font-normal">(optional)</span>
                </label>
                <Input
                  placeholder='e.g. "Master bathroom" or "Our new kitchen"'
                  value={pd.projectName}
                  onChange={e => upd({ projectName: e.target.value })}
                  className="bg-muted border-border focus:border-primary text-[13px]"
                  autoFocus
                />
              </div>
            )}
          </div>
        )

      // ── Step 1: Photos ───────────────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-5">
            <ImageDropZone
              label="Current photos"
              hint="How the space looks right now (up to 3 photos)"
              files={pd.currentPhotos}
              onChange={f => upd({ currentPhotos: f })}
              maxFiles={3}
            />
            <div className="h-px bg-border" />
            <ImageDropZone
              label="Inspiration photo"
              hint="A Pinterest pin, magazine image, or screenshot of the look you want"
              files={pd.inspirationPhotos}
              onChange={f => upd({ inspirationPhotos: f })}
              maxFiles={1}
            />
            <WizardNote>
              No inspiration photo? No problem — skip it and we'll base the analysis on your current space and budget.
            </WizardNote>
          </div>
        )

      // ── Step 2: Measurements ─────────────────────────────────────────────
      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'lengthFt' as const, label: 'Length', icon: '↔️', placeholder: '3.5' },
                { key: 'widthFt'  as const, label: 'Width',  icon: '↕️', placeholder: '2.5' },
                { key: 'heightFt' as const, label: 'Height', icon: '↑',  placeholder: '2.4' },
              ].map(({ key, label, icon, placeholder }) => (
                <div key={key}>
                  <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">
                    {icon} {label}
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      placeholder={placeholder}
                      value={pd[key]}
                      onChange={e => upd({ [key]: e.target.value })}
                      className="bg-muted border-border focus:border-primary text-[13px] font-mono pr-7"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground">m</span>
                  </div>
                </div>
              ))}
            </div>

            {floorAreaSqm !== null && (
              <div className="rounded-[12px] bg-muted p-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-muted-foreground">Floor area</span>
                  <span className="font-mono font-semibold text-foreground">{floorAreaSqm} m²</span>
                </div>
                {wallAreaSqm !== null && (
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-muted-foreground">Wall area (approx)</span>
                    <span className="font-mono font-semibold text-foreground">{wallAreaSqm} m²</span>
                  </div>
                )}
              </div>
            )}

            <div className="h-px bg-border" />

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">
                What would you like to change? <span className="normal-case font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                placeholder='"New shower, better storage, feels dated — want it to feel modern and spa-like"'
                value={pd.inspirationText}
                onChange={e => upd({ inspirationText: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-[10px] border border-border bg-muted text-[13px] text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>
        )

      // ── Step 3: Budget + location ─────────────────────────────────────────
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">Total budget</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">£</span>
                <Input
                  placeholder="8,000"
                  value={pd.budget}
                  onChange={e => upd({ budget: e.target.value })}
                  className="bg-muted border-border focus:border-primary text-[13px] pl-6"
                />
              </div>
              {pd.budget && budgetNum < 1000 && (
                <p className="text-[11px] text-destructive mt-1">Minimum £1,000</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">Country</label>
                <select
                  value={pd.state}
                  onChange={e => upd({ state: e.target.value })}
                  className="w-full bg-muted border-[1.5px] border-border rounded-[10px] px-3 py-[9px] text-[13px] text-foreground font-sans outline-none focus:border-primary transition-colors"
                >
                  <option value="">Select country</option>
                  {UK_COUNTRIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-1.5">City / Town</label>
                <Input
                  placeholder="e.g. Manchester"
                  value={pd.city}
                  onChange={e => upd({ city: e.target.value })}
                  className="bg-muted border-border focus:border-primary text-[13px]"
                />
              </div>
            </div>

            <div className="h-px bg-border" />

            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.05em] mb-2">
                Type of home <span className="normal-case font-normal">(optional)</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {HOME_TYPES.map(ht => (
                  <OptionCard
                    key={ht.id}
                    emoji={ht.emoji}
                    title={ht.title}
                    subtitle={ht.subtitle}
                    selected={pd.homeType === ht.id}
                    onClick={() => upd({ homeType: pd.homeType === ht.id ? '' : ht.id })}
                    small
                  />
                ))}
              </div>
            </div>
          </div>
        )

      // ── Step 4: Review ────────────────────────────────────────────────────
      case 4:
        return (
          <div className="space-y-4">
            <div className="rounded-[12px] bg-muted p-4 space-y-2.5">
              {[
                {
                  label: 'Space',
                  value: ROOM_TYPES.find(r => r.id === pd.roomType)?.title ?? pd.roomType,
                },
                pd.projectName ? { label: 'Name', value: pd.projectName } : null,
                {
                  label: 'Photos',
                  value: [
                    pd.currentPhotos.length > 0 ? `${pd.currentPhotos.length} current` : null,
                    pd.inspirationPhotos.length > 0 ? `${pd.inspirationPhotos.length} inspiration` : null,
                  ].filter(Boolean).join(', ') || 'None uploaded',
                },
                floorAreaSqm !== null ? {
                  label: 'Measurements',
                  value: `${pd.lengthFt} × ${pd.widthFt} × ${pd.heightFt} m  ·  ${floorAreaSqm} m² floor`,
                } : null,
                {
                  label: 'Budget',
                  value: `£${budgetNum.toLocaleString()}`,
                },
                (pd.city || pd.state) ? { label: 'Location', value: [pd.city, pd.state].filter(Boolean).join(', ') } : null,
                pd.homeType ? {
                  label: 'Home type',
                  value: HOME_TYPES.find(h => h.id === pd.homeType)?.title ?? pd.homeType,
                } : null,
                pd.inspirationText ? { label: 'Goals', value: `"${pd.inspirationText}"` } : null,
              ].filter(Boolean).map((row, i) => (
                <div key={i} className="flex items-start justify-between gap-4 text-[12px]">
                  <span className="text-muted-foreground flex-shrink-0">{row!.label}</span>
                  <span className="font-medium text-foreground text-right">{row!.value}</span>
                </div>
              ))}
            </div>

            <WizardNote>
              We'll analyse your space and tell you exactly what you can achieve — in about 15 seconds.
            </WizardNote>
          </div>
        )

      default:
        return null
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const progressPct = step >= 5 ? 100 : Math.round(((step + 1) / 5) * 100)
  const isAnalysing = step === 5

  return (
    <div className="w-full max-w-[520px] px-4 py-6">
      <div className="h-[3px] bg-muted rounded-full overflow-hidden mb-0">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-[cubic-bezier(.4,0,.2,1)]"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="bg-card rounded-[18px] shadow-[0_8px_40px_rgba(28,25,23,0.10),0_2px_8px_rgba(28,25,23,0.05)] overflow-hidden">
        {isAnalysing ? (
          <AnalysingStep
            error={error}
            onRetry={() => { setError(null); setStep(4) }}
          />
        ) : (
          <>
            <div className="px-8 pt-8 pb-0 text-center">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mb-2">
                {STEP_META[step].label}
              </div>
              <h1 className="font-serif text-[26px] font-semibold text-foreground leading-tight mb-2">
                {STEP_META[step].title}
              </h1>
              <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[340px] mx-auto">
                {STEP_META[step].subtitle}
              </p>
            </div>

            <div className="px-8 py-6">
              {renderStep()}
            </div>

            <div className="px-8 pb-8 flex items-center justify-between">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft size={14} /> Back
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
                {step < 4
                  ? <><span>Continue</span> <ChevronRight size={14} /></>
                  : <><span>Analyse my space</span> <ChevronRight size={14} /></>
                }
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
