"use client"

import React, { useState } from 'react';
import { useOnboarding } from "@/contexts/onboarding-context";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
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
  Settings,
  Workflow,
  Cpu,
  Zap,
  PaintBucket,
  Play,
  Clock
} from 'lucide-react';

interface ProjectData {
  projectName: string;
  siteType: 'empty' | 'existing' | '';
  projectType: 'residential' | 'commercial' | '';
  constructionPath: 'masonry' | 'timber' | 'precision' | '';
  scopeOfWork: 'construction' | 'extension' | 'renovation' | '';
  selectedPhases: string[];
  isProjectUnderway: boolean;
  completedPhases: string[];
  hasBasement: boolean;
  city: string;
  country: string;
  area: string;
  floors: string;
  hasDrawings: boolean;
  drawings: File[];
  budget: string;
  timeline: string;
}

const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="flex gap-1 mb-8">
    {[...Array(totalSteps)].map((_, i) => (
      <div 
        key={i} 
        className={`h-1 flex-1 transition-all duration-500 ${i <= currentStep ? 'bg-primary' : 'bg-muted'}`}
      />
    ))}
  </div>
);

export default function ProjectWizardPage() {
  const { nextStep, updateData, data } = useOnboarding();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [projectData, setProjectData] = useState<ProjectData>({
    projectName: data.projectName || '',
    siteType: data.siteType || '',
    projectType: data.projectType || '',
    constructionPath: data.constructionPath || '',
    scopeOfWork: data.scopeOfWork || '',
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
    timeline: data.timeline || '6'
  });

  const nextWizardStep = () => setStep(s => s + 1);
  const prevWizardStep = () => setStep(s => s - 1);

  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    setError(null);
    setIsCompleting(true);
    try {
      updateData(projectData);
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }

      router.push('/auth/signup/setup');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCompleting(false);
    }
  };

  const updateProjectData = (updates: Partial<ProjectData>) => {
    setProjectData(prev => ({ ...prev, ...updates }));
  };

  const resetSubsequentSelections = (level: 'siteType' | 'projectType') => {
    if (level === 'siteType') {
      setProjectData(prev => ({ ...prev, projectType: '', scopeOfWork: '' }));
    } else if (level === 'projectType') {
      setProjectData(prev => ({ ...prev, scopeOfWork: '' }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    updateProjectData({ drawings: [...projectData.drawings, ...pdfFiles] });
  };

  const removeFile = (index: number) => {
    const updatedFiles = projectData.drawings.filter((_, i) => i !== index);
    updateProjectData({ drawings: updatedFiles });
  };

  const togglePhase = (phaseId: string) => {
    const updatedPhases = projectData.selectedPhases.includes(phaseId)
      ? projectData.selectedPhases.filter(id => id !== phaseId)
      : [...projectData.selectedPhases, phaseId];
    updateProjectData({ selectedPhases: updatedPhases });
  };

  const toggleCompletedPhase = (phaseId: string) => {
    const updatedCompletedPhases = projectData.completedPhases.includes(phaseId)
      ? projectData.completedPhases.filter(id => id !== phaseId)
      : [...projectData.completedPhases, phaseId];
    updateProjectData({ completedPhases: updatedCompletedPhases });
  };

  const getConstructionPhases = () => {
    const phasesByEngine = {
      masonry: [
        { id: 'masonry-1', title: 'Pre-Construction', desc: 'Permits & Excavation', icon: Settings },
        { id: 'masonry-2', title: 'Substructure', desc: 'Foundation & Plinth', icon: Workflow },
        { id: 'masonry-3', title: 'Grey Structure', desc: 'Pillars, Walls, & Roof Slab', icon: Building2 },
        { id: 'masonry-4', title: 'MEP Rough-ins', desc: 'Piping & Wiring in walls', icon: Zap },
        { id: 'masonry-5', title: 'Finishing', desc: 'Plaster, Paint, & Tile', icon: PaintBucket }
      ],
      timber: [
        { id: 'timber-1', title: 'Pre-Construction', desc: 'Permits & Site Prep', icon: Settings },
        { id: 'timber-2', title: 'Foundation', desc: 'Slab, Crawlspace, or Pier', icon: Workflow },
        { id: 'timber-3', title: 'Framing', desc: 'The "Skeleton" (Studs & Roof)', icon: Building2 },
        { id: 'timber-4', title: 'Rough-ins', desc: 'Plumbing/Elec before Drywall', icon: Zap },
        { id: 'timber-5', title: 'Fix-out / Handover', desc: 'Drywall, Trim, & Paint', icon: PaintBucket }
      ],
      precision: [
        { id: 'precision-1', title: 'Design & Planning', desc: 'Detailed CAD/Specs', icon: Settings },
        { id: 'precision-2', title: 'Groundworks', desc: 'Foundations & Utilities', icon: Workflow },
        { id: 'precision-3', title: 'Assembly', desc: 'Panel/Module Installation', icon: Cpu },
        { id: 'precision-4', title: 'Service Integration', desc: 'System hookups', icon: Zap },
        { id: 'precision-5', title: 'Interior Fit-out', desc: 'Final Finishing', icon: PaintBucket }
      ]
    };
    
    return phasesByEngine[projectData.constructionPath] || [];
  };

  const steps = [
    {
      title: "Project Basics",
      description: "Tell us about your construction project",
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name</Label>
            <Input 
              id="projectName"
              placeholder="e.g. Blue Sky Residence" 
              value={projectData.projectName} 
              onChange={(e) => updateProjectData({ projectName: e.target.value })}
            />
          </div>
          
          {/* Site Type Selection */}
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
                  onClick={() => {
                    updateProjectData({ siteType: site.id });
                    resetSubsequentSelections('siteType');
                  }}
                  className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all text-center ${
                    projectData.siteType === site.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-primary/50'
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

          {/* Project Type Selection - Only show if site type is selected */}
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
                    onClick={() => {
                      updateProjectData({ projectType: type.id });
                      resetSubsequentSelections('projectType');
                    }}
                    className={`p-4 border rounded-lg flex flex-col items-center gap-2 transition-all ${
                      projectData.projectType === type.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <type.icon size={20} />
                    <span className="text-xs font-medium uppercase tracking-wide">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      title: "Construction Method & Location",
      description: "Select your construction approach and location",
      content: (
        <div className="space-y-6">
          {/* Construction Path Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Construction Method</Label>
              <p className="text-sm text-muted-foreground mb-4">Choose the construction approach that matches your region and requirements</p>
              
              <div className="space-y-3">
                {[
                  {
                    id: 'masonry' as const,
                    label: 'Masonry & RCC',
                    subtitle: 'The "Solid" Build',
                    icon: Layers,
                    regions: 'South Asia, Middle East, Mediterranean, Africa, Latin America',
                    focus: 'Wet trades (concrete, bricks, plaster), curing times, and weight-based material tracking'
                  },
                  {
                    id: 'timber' as const,
                    label: 'Timber & Light Frame',
                    subtitle: 'The "Stick" Build',
                    icon: TreePine,
                    regions: 'USA, Canada, Australia, NZ, Japan, parts of UK/Scandinavia',
                    focus: 'Dry trades (lumber, drywall, insulation), precision framing, and municipal inspection stages'
                  },
                  {
                    id: 'precision' as const,
                    label: 'Precision & Pre-fab',
                    subtitle: 'The "System" Build',
                    icon: Cog,
                    regions: 'Germany, Northern Europe, Singapore',
                    focus: 'Energy efficiency ratings (U-values), pre-cast elements, and high-spec membranes'
                  }
                ].map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => updateProjectData({ constructionPath: method.id })}
                    className={`p-4 border rounded-lg text-left transition-all w-full ${
                      projectData.constructionPath === method.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <method.icon size={24} className={projectData.constructionPath === method.id ? 'text-primary' : 'text-muted-foreground'} />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{method.label}</div>
                        <div className="text-xs text-primary font-medium mb-2">{method.subtitle}</div>
                        <div className="text-xs text-muted-foreground mb-1">
                          <span className="font-medium">Where:</span> {method.regions}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium">Focus:</span> {method.focus}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location Details - Only show if construction path is selected */}
          {projectData.constructionPath && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="text-primary" size={24} />
                <div>
                  <h3 className="font-semibold">Location Details</h3>
                  <p className="text-sm text-muted-foreground">This helps us provide region-specific material costs and regulations</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city"
                    placeholder="e.g. New York" 
                    value={projectData.city} 
                    onChange={(e) => updateProjectData({ city: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input 
                    id="country"
                    placeholder="e.g. United States" 
                    value={projectData.country} 
                    onChange={(e) => updateProjectData({ country: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      title: "Project Scope & Scale",
      description: "Define your project specifications",
      content: (
        <div className="space-y-6">
          {/* Project Summary */}
          <div className="bg-muted/50 p-4 rounded-lg border">
            <h3 className="font-semibold text-sm mb-2">Project Summary</h3>
            <p className="text-sm text-muted-foreground">
              {projectData.projectType.charAt(0).toUpperCase() + projectData.projectType.slice(1)} project on {' '}
              {projectData.siteType === 'empty' ? 'empty plot' : 'existing structure'} in {' '}
              {projectData.city}, {projectData.country} using {' '}
              {projectData.constructionPath === 'masonry' ? 'Masonry & RCC' : 
               projectData.constructionPath === 'timber' ? 'Timber & Light Frame' : 'Precision & Pre-fab'} construction
            </p>
          </div>

          {/* Project Status */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Project Status</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => updateProjectData({ isProjectUnderway: false, completedPhases: [] })}
                  className={`p-4 border rounded-lg flex items-center gap-3 transition-all ${
                    !projectData.isProjectUnderway 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <Play size={20} className={!projectData.isProjectUnderway ? 'text-primary' : 'text-muted-foreground'} />
                  <div className="text-left">
                    <div className="text-sm font-medium">Starting Fresh</div>
                    <div className="text-xs text-muted-foreground">Beginning from the planning stage</div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => updateProjectData({ isProjectUnderway: true })}
                  className={`p-4 border rounded-lg flex items-center gap-3 transition-all ${
                    projectData.isProjectUnderway 
                      ? 'border-primary bg-primary/5' 
                      : 'border-muted hover:border-primary/50'
                  }`}
                >
                  <Clock size={20} className={projectData.isProjectUnderway ? 'text-primary' : 'text-muted-foreground'} />
                  <div className="text-left">
                    <div className="text-sm font-medium">Already Underway</div>
                    <div className="text-xs text-muted-foreground">Some phases are already completed</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Construction Phases */}
          {projectData.constructionPath && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>
                  {projectData.isProjectUnderway 
                    ? "Phase Management - Mark completed phases and select what you want to manage with us" 
                    : "Scope of Work - Construction Phases"
                  }
                </Label>
                <p className="text-sm text-muted-foreground">
                  {projectData.isProjectUnderway 
                    ? "Check off phases you've already completed, then select which remaining phases you want to manage with us"
                    : "Select the phases you want to manage in this project"
                  }
                </p>
                
                <div className="grid grid-cols-1 gap-3">
                  {getConstructionPhases().map(phase => {
                    const isCompleted = projectData.completedPhases.includes(phase.id);
                    const isSelected = projectData.selectedPhases.includes(phase.id);
                    
                    return (
                      <div key={phase.id} className="space-y-2">
                        {/* Phase with completion toggle for underway projects */}
                        <div className={`p-3 border rounded-lg flex items-center gap-3 ${
                          isCompleted ? 'bg-green-50 border-green-200' : 'bg-background'
                        }`}>
                          <phase.icon size={20} className={isCompleted ? 'text-green-600' : 'text-muted-foreground'} />
                          <div className="flex-1">
                            <div className={`text-sm font-medium ${isCompleted ? 'text-green-800 line-through' : ''}`}>
                              {phase.title}
                            </div>
                            <div className="text-xs text-muted-foreground">{phase.desc}</div>
                          </div>
                          
                          {projectData.isProjectUnderway && (
                            <button
                              type="button"
                              onClick={() => toggleCompletedPhase(phase.id)}
                              className="mr-2"
                            >
                              {isCompleted ? 
                                <CheckSquare size={16} className="text-green-600" /> : 
                                <Square size={16} className="text-muted-foreground" />
                              }
                            </button>
                          )}
                          
                          {/* Selection toggle - only for non-completed phases or all phases if not underway */}
                          {(!projectData.isProjectUnderway || !isCompleted) && (
                            <button
                              type="button"
                              onClick={() => togglePhase(phase.id)}
                              className={`p-2 rounded transition-all ${
                                isSelected ? 'bg-primary text-white' : 'bg-muted hover:bg-primary/10'
                              }`}
                            >
                              <span className="text-xs font-medium">
                                {isSelected ? 'Selected' : 'Select'}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Scale Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area">Total Covered Area (sq ft)</Label>
                <Input 
                  id="area"
                  placeholder="e.g. 4500" 
                  value={projectData.area} 
                  onChange={(e) => updateProjectData({ area: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="floors">Number of Floors</Label>
                <Input 
                  id="floors"
                  type="number" 
                  placeholder="1" 
                  value={projectData.floors} 
                  onChange={(e) => updateProjectData({ floors: e.target.value })}
                />
              </div>
              
              {/* Basement Toggle */}
              <div className="space-y-2">
                <Label>Basement</Label>
                <button
                  type="button"
                  onClick={() => updateProjectData({ hasBasement: !projectData.hasBasement })}
                  disabled={projectData.siteType === 'existing'}
                  className={`p-3 border rounded-lg flex items-center justify-center gap-2 transition-all w-full ${
                    projectData.siteType === 'existing' 
                      ? 'bg-muted/30 opacity-50 cursor-not-allowed' 
                      : 'hover:border-primary/50'
                  }`}
                >
                  {projectData.hasBasement ? 
                    <CheckSquare size={20} className="text-primary" /> : 
                    <Square size={20} className="text-muted-foreground" />
                  }
                  <span className="text-sm font-medium">
                    {projectData.siteType === 'existing' ? 'Not Available' : 'Include Basement'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Documentation & Budget",
      description: "Upload documents and set financial parameters",
      content: (
        <div className="space-y-6">
          {/* Drawings/BOQ Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Project Documentation</Label>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => updateProjectData({ hasDrawings: !projectData.hasDrawings })}
                  className="p-4 border rounded-lg flex items-center justify-between w-full transition-all hover:border-primary/50"
                >
                  <div className="flex items-center gap-3">
                    {projectData.hasDrawings ? 
                      <CheckSquare size={20} className="text-primary" /> : 
                      <Square size={20} className="text-muted-foreground" />
                    }
                    <div className="text-left">
                      <div className="text-sm font-medium">I have drawings or BOQ documents</div>
                      <div className="text-xs text-muted-foreground">Upload architectural drawings, BOQ, or project specifications</div>
                    </div>
                  </div>
                </button>

                {/* File Upload Section */}
                {projectData.hasDrawings && (
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex items-center justify-center p-4 border-2 border-dashed border-muted-foreground/50 rounded-lg cursor-pointer hover:border-primary/50 transition-all"
                      >
                        <div className="text-center">
                          <Upload size={24} className="mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">Upload PDF documents</p>
                          <p className="text-xs text-muted-foreground">Drag & drop or click to browse</p>
                        </div>
                      </label>
                    </div>

                    {/* Uploaded Files List */}
                    {projectData.drawings.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs">Uploaded Files:</Label>
                        {projectData.drawings.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded border">
                            <div className="flex items-center gap-2">
                              <FileText size={16} className="text-primary" />
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-muted-foreground">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                            </div>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Budget & Timeline */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Target Budget ($)</Label>
              <Input 
                id="budget"
                placeholder="5,000,000" 
                value={projectData.budget} 
                onChange={(e) => updateProjectData({ budget: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Expected Timeline (Months)</Label>
              <input 
                type="range" 
                min="1" 
                max="24" 
                step="1" 
                value={projectData.timeline} 
                onChange={(e) => updateProjectData({ timeline: e.target.value })}
                className="w-full accent-primary" 
              />
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>1 Month</span>
                <span className="text-foreground font-medium">{projectData.timeline} Months</span>
                <span>24 Months</span>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const isStep1Complete = projectData.projectName && projectData.siteType && projectData.projectType;
  const isStep2Complete = projectData.constructionPath && projectData.city && projectData.country;
  const isStep3Complete = projectData.area && projectData.floors && projectData.selectedPhases.length > 0;

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
        {error && <p className="text-sm text-red-500 bg-red-100 p-3 rounded-md mb-4">{error}</p>}
        <div className="min-h-[300px]">
          {steps[step].content}
        </div>
      </CardContent>

      <CardFooter className="flex justify-between">
        {step > 0 ? (
          <Button variant="outline" onClick={prevWizardStep}>
            <ChevronLeft size={18} className="mr-1" /> Back
          </Button>
        ) : <div />}
        
        {step < steps.length - 1 ? (
          <Button 
            onClick={nextWizardStep}
            disabled={
              (step === 0 && !isStep1Complete) || 
              (step === 1 && !isStep2Complete) ||
              (step === 2 && !isStep3Complete)
            }
          >
            Continue <ChevronRight size={18} className="ml-1" />
          </Button>
        ) : (
          <Button onClick={handleComplete} disabled={isCompleting}>
            {isCompleting ? 'Creating Project...' : <><Hammer size={18} className="mr-2" /> Create Project</>}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}