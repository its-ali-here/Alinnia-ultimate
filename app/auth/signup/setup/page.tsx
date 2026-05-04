"use client"

import Link from 'next/link'
import { CheckCircle2, LayoutGrid, TrendingUp, ListOrdered, CheckSquare } from 'lucide-react'
import { useOnboarding } from '@/contexts/onboarding-context'

const BUILD_LABELS: Record<string, string> = {
  'kitchen':    'Kitchen remodel',
  'bathroom':   'Bathroom remodel',
  'full-reno':  'Full home renovation',
  'addition':   'Extension / Addition',
  'bedroom':    'Bedroom renovation',
  'multi-room': 'Multi-room renovation',
}

export default function OnboardingSetupPage() {
  const { data } = useOnboarding()

  const highlights = [
    { icon: TrendingUp, label: 'Budget & Cash Flow', desc: 'Track spend vs. your budget in real time' },
    { icon: ListOrdered, label: 'Timeline', desc: 'Your construction phases are ready to manage' },
    { icon: CheckSquare, label: 'Punch List', desc: 'Log and sign off on every finishing item' },
    { icon: LayoutGrid, label: 'Overview dashboard', desc: 'Your project health at a glance' },
  ]

  return (
    <div className="w-full max-w-lg text-center">
      {/* Success icon */}
      <div className="mb-5 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-8 w-8 text-emerald-600" strokeWidth={1.6} />
        </div>
      </div>

      <h1 className="font-serif text-3xl font-semibold text-foreground">
        {data.projectName ? `"${data.projectName}" is ready` : "Your project is ready"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Everything has been saved. Head to your dashboard to start tracking.
      </p>

      {/* What's set up */}
      <div className="mt-8 rounded-xl border border-border bg-card p-5 text-left shadow-sm">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">What's set up for you</p>
        <div className="space-y-3">
          {highlights.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-soft))]">
                <Icon className="h-4 w-4 text-primary" strokeWidth={1.7} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project summary if data available */}
      {(data.city || data.budget || data.buildType) && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {data.buildType && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {BUILD_LABELS[data.buildType] ?? data.buildType}
            </span>
          )}
          {data.city && data.country && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {data.city}, {data.country}
            </span>
          )}
          {data.budget && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              Budget ${parseFloat(data.budget).toLocaleString()}
            </span>
          )}
          {data.timeline && (
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              {data.timeline} month timeline
            </span>
          )}
        </div>
      )}

      <Link href="/control-centre" className="mt-8 block">
        <button className="w-full rounded-full bg-primary py-3 text-sm font-medium text-white transition-opacity hover:opacity-90">
          Go to my dashboard →
        </button>
      </Link>

      <p className="mt-3 text-xs text-muted-foreground">
        You can add more projects and update settings anytime.
      </p>
    </div>
  )
}
