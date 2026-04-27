"use client"

import React, { useState } from 'react'
import { useOnboarding } from "@/contexts/onboarding-context"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { createSupabaseBrowserClient } from '@/lib/supabase'
import {
  ChevronRight,
  ChevronLeft,
  Building2,
  Home,
  MapPin,
  Hammer,
  Globe,
  CheckSquare,
  Square,
  Upload,
  FileText,
  Layers,
  TreePine,
  Cog,
  Workflow,
  Cpu,
  Zap,
  PaintBucket,
  Play,
  Clock,
  Shovel,
  RotateCcw,
  PlusSquare,
} from 'lucide-react'

interface ProjectData {
  projectName: string
  siteType: 'empty' | 'existing' | ''
  projectType: 'residential' | 'commercial' | ''
  scopeOfWork: 'construction' | 'extension' | 'renovation' | ''
  constructionPath: 'masonry' | 'timber' | 'precision' | ''
  selectedPhases: string[]
  isProjectUnderway: boolean
  completedPhases: string[]
  hasBasement: boolean
  city: string
  country: string
  area: string
  floors: string
  hasDrawings: boolean
  drawings: File[]
  budget: string
  startDate: string
  timeline: string
}

const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="flex gap-1 mb-8">
    {[...Array(totalSteps)].map((_, i) => (
      <div
        key={i}
        className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= currentStep ? 'bg-primary' : 'bg-muted'}`}
      />
    ))}
  </div>
)

export default function ProjectWizardPage() {
  const { updateData, data } = useOnboarding()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [projectData, setProjectData] = useState<ProjectData>({
    projectName: data.projectName || '',
    siteType: data.siteType || '',
    projectType: data.projectType || '',
    scopeOfWork: data.scopeOfWork || '',
    constructionPath: data.constructionPath || '',
    selectedPhases: data.selectedPhases || [],
    isProjectUnderway: data.isProjectUnderway || false,
    completedPhases: data.completedPhases || [],
    hasBasement: data.hasBasement || false,
    city: data.city || '',
    country: data.country || '',
    area: data.area || '',
    floors: data.floors || '1',
    hasDrawings: data.hasDrawings || false,
    drawings: data.drawings || [],
    budget: data.budget || '',
    startDate: data.startDate || new Date().toISOString().split('T')[0],
    timeline: data.timeline || '6',
  })

  const [isCompleting, setIsCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nextWizardStep = () => setStep(s => s + 1)
  const prevWizardStep = () => setStep(s => s - 1)

  const updateProjectData = (updates: Partial<ProjectData>) => {
    setProjectData(prev => ({ ...prev, ...updates }))
  }

  const handleSiteTypeSelect = (siteType: 'empty' | 'existing') => {
    setProjectData(prev => ({
      ...prev,
      siteType,
      projectType: '',
      // Empty plot is always new construction; existing needs user to choose
      scopeOfWork: siteType === 'empty' ? 'construction' : '',
    }))
  }

  const handleProjectTypeSelect = (projectType: 'residential' | 'commercial') => {
    setProjectData(prev => ({
      ...prev,
      projectType,
      // Reset scope only if site is existing (empty plot scope stays as 'construction')
      scopeOfWork: prev.siteType === 'existing' ? '' : prev.scopeOfWork,
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const pdfFiles = files.filter(file => file.type === 'application/pdf')
    updateProjectData({ drawings: [...projectData.drawings, ...pdfFiles] })
  }

  const removeFile = (index: number) => {
    updateProjectData({ drawings: projectData.drawings.filter((_, i) => i !== index) })
  }

  const togglePhase = (phaseId: string) => {
    const updated = projectData.selectedPhases.includes(phaseId)
      ? projectData.selectedPhases.filter(id => id !== phaseId)
      : [...projectData.selectedPhases, phaseId]
    updateProjectData({ selectedPhases: updated })
  }

  const toggleCompletedPhase = (phaseId: string) => {
    const updated = projectData.completedPhases.includes(phaseId)
      ? projectData.completedPhases.filter(id => id !== phaseId)
      : [...projectData.completedPhases, phaseId]
    updateProjectData({ completedPhases: updated })
  }

  type Phase = { id: string; title: string; desc: string; icon: React.ElementType }
  const getConstructionPhases = (): Phase[] => {
    const phasesByPath = {
      masonry: [
        { id: 'masonry-1', title: 'Pre-Construction', desc: 'Permits & Excavation', icon: Cog },
        { id: 'masonry-2', title: 'Substructure', desc: 'Foundation & Plinth', icon: Workflow },
        { id: 'masonry-3', title: 'Grey Structure', desc: 'Pillars, Walls & Roof Slab', icon: Building2 },
        { id: 'masonry-4', title: 'MEP Rough-ins', desc: 'Piping & Wiring in walls', icon: Zap },
        { id: 'masonry-5', title: 'Finishing', desc: 'Plaster, Paint & Tile', icon: PaintBucket },
      ],
      timber: [
        { id: 'timber-1', title: 'Pre-Construction', desc: 'Permits & Site Prep', icon: Cog },
        { id: 'timber-2', title: 'Foundation', desc: 'Slab, Crawlspace, or Pier', icon: Workflow },
        { id: 'timber-3', title: 'Framing', desc: 'Studs, Rafters & Roof', icon: Building2 },
        { id: 'timber-4', title: 'Rough-ins', desc: 'Plumbing & Electrical before Drywall', icon: Zap },
        { id: 'timber-5', title: 'Fix-out / Handover', desc: 'Drywall, Trim & Paint', icon: PaintBucket },
      ],
      precision: [
        { id: 'precision-1', title: 'Design & Planning', desc: 'Detailed CAD / Specs', icon: Cog },
        { id: 'precision-2', title: 'Groundworks', desc: 'Foundations & Utilities', icon: Workflow },
        { id: 'precision-3', title: 'Assembly', desc: 'Panel / Module Installation', icon: Cpu },
        { id: 'precision-4', title: 'Service Integration', desc: 'System hookups', icon: Zap },
        { id: 'precision-5', title: 'Interior Fit-out', desc: 'Final Finishing', icon: PaintBucket },
      ],
    }
    if (!projectData.constructionPath) return []
    return phasesByPath[projectData.constructionPath] || []
  }

  const handleComplete = async () => {
    setError(null)
    setIsCompleting(true)
    try {
      // 1. Upload drawings to Supabase Storage before calling the API
      const uploadedFiles: { path: string; name: string }[] = []
      if (projectData.hasDrawings && projectData.drawings.length > 0) {
        const supabase = createSupabaseBrowserClient()
        for (const file of projectData.drawings) {
          const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(`drawings/${safeName}`, file, { cacheControl: '3600', upsert: false })
          if (!uploadError && uploadData) {
            uploadedFiles.push({ path: uploadData.path, name: file.name })
          }
          // If upload fails (e.g. bucket doesn't exist) we continue — project still creates
        }
      }

      // 2. Persist non-File data to context
      const { drawings: _files, ...serializableData } = projectData
      updateData({ ...serializableData, startDate: projectData.startDate })

      // 3. Call the API with all project data + uploaded file paths
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...serializableData, uploadedFiles }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Something went wrong')
      }

      const result = await response.json()
      // Store created project id in context for setup page
      updateData({ projectName: projectData.projectName })

      router.push('/auth/signup/setup')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsCompleting(false)
    }
  }

  // ── Step definitions ──────────────────────────────────────────────────────

  const steps = [
    {
      title: "Project Basics",
      description: "Tell us about your project",
      content: (
        <div className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input
              id="projectName"
              placeholder="e.g. Blue Sky Residence"
              value={projectData.projectName}
              onChange={(e) => updateProjectData({ projectName: e.target.value })}
            />
          </div>

          {/* Site Type */}
          <div className="space-y-2">
            <Label>Site Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'empty' as const, label: 'Empty Plot', icon: MapPin, desc: 'Starting from scratch' },
                { id: 'existing' as const, label: 'Existing Structure', icon: Building2, desc: 'Working with current building' },
              ].map(site => (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => handleSiteTypeSelect(site.id)}
                  className={`p-4 border rounded-lg flex flex-col items-center gap-2 text-center transition-all ${
                    projectData.siteType === site.id ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <site.icon size={20} />
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide">{site.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{site.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Project Type */}
          {projectData.siteType && (
            <div className="space-y-2">
              <Label>Project Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'residential' as const, label: 'Residential', icon: Home },
                  { id: 'commercial' as const, label: 'Commercial', icon: Building2 },
                ].map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleProjectTypeSelect(type.id)}
                    className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${
                      projectData.projectType === type.id ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <type.icon size={20} />
                    <span className="text-xs font-medium uppercase tracking-wide">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Scope of Work */}
          {projectData.projectType && (
            <div className="space-y-2">
              <Label>Scope of Work</Label>
              {projectData.siteType === 'empty' ? (
                // Auto-selected for empty plots
                <div className="flex items-center gap-3 rounded-lg border border-primary bg-primary/5 p-3">
                  <Shovel size={18} className="text-primary flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium">New Construction</div>
                    <div className="text-xs text-muted-foreground">Building from scratch on empty land</div>
                  </div>
                  <CheckSquare size={16} className="text-primary ml-auto" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'renovation' as const, label: 'Renovation', icon: RotateCcw, desc: 'Upgrading or rebuilding existing spaces' },
                    { id: 'extension' as const, label: 'Extension', icon: PlusSquare, desc: 'Adding new space to existing structure' },
                  ].map(scope => (
                    <button
                      key={scope.id}
                      type="button"
                      onClick={() => updateProjectData({ scopeOfWork: scope.id })}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        projectData.scopeOfWork === scope.id ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <scope.icon size={18} className={projectData.scopeOfWork === scope.id ? 'text-primary mb-2' : 'text-muted-foreground mb-2'} />
                      <div className="text-xs font-medium uppercase tracking-wide">{scope.label}</div>
                      <div className="text-xs text-muted-foreground mt-1">{scope.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Construction Method & Location",
      description: "Select your construction approach and project location",
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Construction Method</Label>
            <p className="text-sm text-muted-foreground">Choose the approach that matches your region</p>
            <div className="space-y-3">
              {[
                {
                  id: 'masonry' as const,
                  label: 'Masonry & RCC',
                  subtitle: 'The "Solid" Build',
                  icon: Layers,
                  regions: 'South Asia, Middle East, Mediterranean, Africa, Latin America',
                  focus: 'Wet trades — concrete, bricks, plaster, curing times',
                },
                {
                  id: 'timber' as const,
                  label: 'Timber & Light Frame',
                  subtitle: 'The "Stick" Build',
                  icon: TreePine,
                  regions: 'USA, Canada, Australia, NZ, Japan, UK, Scandinavia',
                  focus: 'Dry trades — lumber, drywall, insulation, municipal inspections',
                },
                {
                  id: 'precision' as const,
                  label: 'Precision & Pre-fab',
                  subtitle: 'The "System" Build',
                  icon: Cog,
                  regions: 'Germany, Northern Europe, Singapore',
                  focus: 'Energy ratings, pre-cast elements, high-spec membranes',
                },
              ].map(method => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => updateProjectData({ constructionPath: method.id })}
                  className={`w-full p-4 border rounded-lg text-left transition-all ${
                    projectData.constructionPath === method.id ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <method.icon size={22} className={projectData.constructionPath === method.id ? 'text-primary mt-0.5' : 'text-muted-foreground mt-0.5'} />
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{method.label}</div>
                      <div className="text-xs text-primary font-medium mb-1">{method.subtitle}</div>
                      <div className="text-xs text-muted-foreground"><span className="font-medium">Where:</span> {method.regions}</div>
                      <div className="text-xs text-muted-foreground mt-0.5"><span className="font-medium">Focus:</span> {method.focus}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {projectData.constructionPath && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Globe className="text-primary flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-sm">Location</h3>
                  <p className="text-xs text-muted-foreground">Helps us surface region-specific material costs</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" placeholder="e.g. New York" value={projectData.city} onChange={(e) => updateProjectData({ city: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" placeholder="e.g. United States" value={projectData.country} onChange={(e) => updateProjectData({ country: e.target.value })} />
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Project Scope & Scale",
      description: "Define the phases and size of your project",
      content: (
        <div className="space-y-6">
          {/* Summary pill */}
          <div className="rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground capitalize">{projectData.projectType}</span> ·{' '}
            <span className="capitalize">{projectData.scopeOfWork}</span> ·{' '}
            {projectData.city}, {projectData.country} ·{' '}
            <span className="capitalize">{projectData.constructionPath}</span> build
          </div>

          {/* Underway? */}
          <div className="space-y-2">
            <Label>Project Status</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: false, label: 'Starting Fresh', desc: 'Beginning from the planning stage', icon: Play },
                { value: true, label: 'Already Underway', desc: 'Some phases are already completed', icon: Clock },
              ].map(opt => (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => updateProjectData({ isProjectUnderway: opt.value, completedPhases: [] })}
                  className={`p-4 border rounded-lg flex items-center gap-3 transition-all ${
                    projectData.isProjectUnderway === opt.value ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <opt.icon size={18} className={projectData.isProjectUnderway === opt.value ? 'text-primary' : 'text-muted-foreground'} />
                  <div className="text-left">
                    <div className="text-sm font-medium">{opt.label}</div>
                    <div className="text-xs text-muted-foreground">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Phase selection */}
          {projectData.constructionPath && (
            <div className="space-y-2">
              <Label>
                {projectData.isProjectUnderway ? 'Mark completed phases, then select what to manage' : 'Select phases to manage'}
              </Label>
              <p className="text-xs text-muted-foreground">
                {projectData.isProjectUnderway
                  ? 'Check off already-completed phases, then pin the ones you want to track going forward'
                  : 'Choose the phases you want to track in Alinnia'}
              </p>
              <div className="space-y-2 mt-2">
                {getConstructionPhases().map(phase => {
                  const isCompleted = projectData.completedPhases.includes(phase.id)
                  const isSelected = projectData.selectedPhases.includes(phase.id)
                  return (
                    <div
                      key={phase.id}
                      className={`flex items-center gap-3 rounded-lg border p-3 ${isCompleted ? 'bg-emerald-50 border-emerald-200' : 'bg-background'}`}
                    >
                      <phase.icon size={18} className={isCompleted ? 'text-emerald-600' : 'text-muted-foreground'} />
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${isCompleted ? 'text-emerald-800 line-through' : ''}`}>{phase.title}</div>
                        <div className="text-xs text-muted-foreground">{phase.desc}</div>
                      </div>
                      {projectData.isProjectUnderway && (
                        <button type="button" onClick={() => toggleCompletedPhase(phase.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                          {isCompleted ? <CheckSquare size={15} className="text-emerald-600" /> : <Square size={15} />}
                          <span className="hidden sm:inline">Done</span>
                        </button>
                      )}
                      {(!projectData.isProjectUnderway || !isCompleted) && (
                        <button
                          type="button"
                          onClick={() => togglePhase(phase.id)}
                          className={`rounded px-2 py-1 text-xs font-medium transition-all ${isSelected ? 'bg-primary text-white' : 'bg-muted hover:bg-primary/10'}`}
                        >
                          {isSelected ? 'Tracking' : 'Track'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Scale */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area">Covered Area (sq ft)</Label>
              <Input id="area" placeholder="e.g. 4500" value={projectData.area} onChange={(e) => updateProjectData({ area: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floors">No. of Floors</Label>
              <Input id="floors" type="number" placeholder="1" value={projectData.floors} onChange={(e) => updateProjectData({ floors: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Basement</Label>
              <button
                type="button"
                onClick={() => updateProjectData({ hasBasement: !projectData.hasBasement })}
                disabled={projectData.siteType === 'existing'}
                className={`w-full p-3 border rounded-lg flex items-center justify-center gap-2 transition-all ${
                  projectData.siteType === 'existing' ? 'opacity-40 cursor-not-allowed' : 'hover:border-primary/50'
                }`}
              >
                {projectData.hasBasement ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} className="text-muted-foreground" />}
                <span className="text-sm">{projectData.siteType === 'existing' ? 'N/A' : 'Basement'}</span>
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Documentation & Budget",
      description: "Upload documents and set your financial parameters",
      content: (
        <div className="space-y-6">
          {/* Drawings / BOQ */}
          <div className="space-y-3">
            <Label>Project Documentation</Label>
            <button
              type="button"
              onClick={() => updateProjectData({ hasDrawings: !projectData.hasDrawings, drawings: [] })}
              className="w-full p-4 border rounded-lg flex items-center justify-between transition-all hover:border-primary/50"
            >
              <div className="flex items-center gap-3">
                {projectData.hasDrawings ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} className="text-muted-foreground" />}
                <div className="text-left">
                  <div className="text-sm font-medium">I have drawings or BOQ documents</div>
                  <div className="text-xs text-muted-foreground">Upload architectural drawings, BOQ, or specs (PDF)</div>
                </div>
              </div>
            </button>

            {projectData.hasDrawings && (
              <div className="space-y-3">
                <input type="file" multiple accept=".pdf" onChange={handleFileUpload} className="hidden" id="file-upload" />
                <label
                  htmlFor="file-upload"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-6 transition-all hover:border-primary/40"
                >
                  <Upload size={22} className="mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Upload PDF documents</p>
                  <p className="text-xs text-muted-foreground">Click to browse</p>
                </label>
                {projectData.drawings.length > 0 && (
                  <div className="space-y-2">
                    {projectData.drawings.map((file, i) => (
                      <div key={i} className="flex items-center justify-between rounded border bg-muted/50 p-2">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-primary" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                        </div>
                        <button onClick={() => removeFile(i)} className="text-xs text-destructive hover:underline">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Project Start Date</Label>
            <Input
              id="startDate"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={projectData.startDate}
              onChange={(e) => updateProjectData({ startDate: e.target.value })}
            />
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget">Total Budget</Label>
            <Input
              id="budget"
              placeholder="e.g. 150000"
              value={projectData.budget}
              onChange={(e) => updateProjectData({ budget: e.target.value })}
            />
          </div>

          {/* Timeline slider */}
          <div className="space-y-2">
            <Label>Expected Timeline</Label>
            <input
              type="range"
              min="1"
              max="36"
              step="1"
              value={projectData.timeline}
              onChange={(e) => updateProjectData({ timeline: e.target.value })}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 month</span>
              <span className="font-medium text-foreground">{projectData.timeline} month{parseInt(projectData.timeline) !== 1 ? 's' : ''}</span>
              <span>36 months</span>
            </div>
          </div>
        </div>
      ),
    },
  ]

  // ── Validation ────────────────────────────────────────────────────────────

  const isStep0Valid = !!(projectData.projectName && projectData.siteType && projectData.projectType && projectData.scopeOfWork)
  const isStep1Valid = !!(projectData.constructionPath && projectData.city && projectData.country)
  const isStep2Valid = !!(projectData.area && projectData.floors && projectData.selectedPhases.length > 0)
  const isStep3Valid = !!(projectData.budget && projectData.startDate)

  const isCurrentStepValid = [isStep0Valid, isStep1Valid, isStep2Valid, isStep3Valid][step]

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          Step {step + 1} of {steps.length}
        </div>
        <CardTitle className="text-2xl">{steps[step].title}</CardTitle>
        <CardDescription>{steps[step].description}</CardDescription>
      </CardHeader>

      <CardContent>
        <StepIndicator currentStep={step} totalSteps={steps.length} />
        {error && <p className="mb-4 rounded-md bg-red-100 p-3 text-sm text-red-500">{error}</p>}
        <div className="min-h-[300px]">{steps[step].content}</div>
      </CardContent>

      <CardFooter className="flex justify-between">
        {step > 0 ? (
          <Button variant="outline" onClick={prevWizardStep}>
            <ChevronLeft size={16} className="mr-1" /> Back
          </Button>
        ) : <div />}

        {step < steps.length - 1 ? (
          <Button onClick={nextWizardStep} disabled={!isCurrentStepValid}>
            Continue <ChevronRight size={16} className="ml-1" />
          </Button>
        ) : (
          <Button onClick={handleComplete} disabled={isCompleting || !isStep3Valid}>
            {isCompleting ? 'Creating project…' : <><Hammer size={16} className="mr-2" /> Create Project</>}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
