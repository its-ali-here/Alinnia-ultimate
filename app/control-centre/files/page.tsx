"use client"

import { useEffect, useRef, useState } from "react"
import { useActiveProject } from "@/contexts/project-context"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import { getProjectDocuments } from "@/lib/project-queries"
import type { Document, FileType } from "@/lib/project-queries"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

type FilterTab = 'All' | 'Plans' | 'Permits' | 'Contracts' | 'Photos' | 'Receipts' | 'Other'

const FILE_TYPE_TO_CATEGORY: Record<FileType, FilterTab> = {
  drawing: 'Plans',
  permit: 'Permits',
  contract: 'Contracts',
  photo: 'Photos',
  invoice: 'Receipts',
  receipt: 'Receipts',
  other: 'Other',
}

const CATEGORY_STYLE: Record<string, { bg: string; stroke: string; badge: string }> = {
  Plans:    { bg: 'bg-[hsl(var(--brand-soft))]', stroke: 'text-primary', badge: 'bg-[hsl(var(--brand-soft))] text-primary' },
  Permits:  { bg: 'bg-amber-50', stroke: 'text-amber-600', badge: 'bg-amber-100 text-amber-700' },
  Contracts:{ bg: 'bg-blue-50', stroke: 'text-blue-600', badge: 'bg-blue-100 text-blue-700' },
  Photos:   { bg: 'bg-emerald-50', stroke: 'text-emerald-600', badge: 'bg-emerald-100 text-emerald-700' },
  Receipts: { bg: 'bg-muted', stroke: 'text-muted-foreground', badge: 'bg-muted text-muted-foreground' },
  Other:    { bg: 'bg-muted', stroke: 'text-muted-foreground', badge: 'bg-muted text-muted-foreground' },
}

const FILE_TYPE_OPTIONS: { value: FileType; label: string }[] = [
  { value: 'drawing',  label: 'Plan / Drawing' },
  { value: 'permit',   label: 'Permit' },
  { value: 'contract', label: 'Contract' },
  { value: 'photo',    label: 'Photo' },
  { value: 'invoice',  label: 'Invoice / Receipt' },
  { value: 'other',    label: 'Other' },
]

const TABS: FilterTab[] = ['All', 'Plans', 'Permits', 'Contracts', 'Photos', 'Receipts', 'Other']

export default function FilesPage() {
  const { activeProject } = useActiveProject()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('All')
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedType, setSelectedType] = useState<FileType>('drawing')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadDocuments = async () => {
    if (!activeProject) return
    const supabase = createSupabaseBrowserClient()
    const data = await getProjectDocuments(supabase, activeProject.id)
    setDocuments(data)
    setLoading(false)
  }

  useEffect(() => { setLoading(true); loadDocuments() }, [activeProject])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setSelectedFile(file); setUploadDialogOpen(true) }
  }

  const handleUpload = async () => {
    if (!activeProject || !selectedFile) return
    setUploading(true)
    const supabase = createSupabaseBrowserClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }

    const safeName = `${activeProject.id}/${Date.now()}-${selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const { data: uploadData, error } = await supabase.storage
      .from('documents')
      .upload(safeName, selectedFile, { upsert: false })

    if (!error && uploadData) {
      await supabase.from('documents').insert({
        project_id: activeProject.id,
        file_name: selectedFile.name,
        file_path: uploadData.path,
        file_type: selectedType,
        uploaded_by: user.id,
      })
    }

    setSelectedFile(null)
    setUploadDialogOpen(false)
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    await loadDocuments()
  }

  const visible = activeTab === 'All'
    ? documents
    : documents.filter(d => FILE_TYPE_TO_CATEGORY[d.file_type] === activeTab)

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 rounded-lg" />
        <div className="grid grid-cols-3 gap-2.5">{[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-28 rounded-lg" />)}</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1 flex-wrap">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${activeTab === tab ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {visible.map(doc => {
          const cat = FILE_TYPE_TO_CATEGORY[doc.file_type]
          const s = CATEGORY_STYLE[cat]
          return (
            <div key={doc.id} className="cursor-pointer rounded-lg border border-border bg-card p-3 transition-all hover:shadow-sm hover:border-border/60">
              <div className={`flex h-9 w-7 items-center justify-center rounded-[5px] ${s.bg} mb-2`}>
                <svg width="14" height="17" viewBox="0 0 14 17" fill="none" className={s.stroke}>
                  <path d="M8.5 1.5H3C2.45 1.5 2 1.95 2 2.5V14.5C2 15.05 2.45 15.5 3 15.5H11C11.55 15.5 12 15.05 12 14.5V5L8.5 1.5Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
                  <path d="M8.5 1.5V5H12" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </div>
              <p className="text-[11px] font-medium text-foreground leading-snug mb-1.5 break-words">{doc.file_name}</p>
              <div className="flex items-center gap-1">
                <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${s.badge}`}>{cat}</span>
                <span className="text-[9px] text-muted-foreground">
                  {new Date(doc.uploaded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          )
        })}

        {/* Upload tile */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex min-h-[96px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-dashed border-border transition-colors hover:bg-muted"
        >
          <Plus className="h-5 w-5 text-muted-foreground/60" strokeWidth={1.5} />
          <span className="text-[11px] text-muted-foreground">Upload file</span>
        </div>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />

      {/* Type picker dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif">Upload document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground truncate">{selectedFile?.name}</p>
            <div className="space-y-1.5">
              <Label>Document type</Label>
              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value as FileType)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                {FILE_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full rounded-full bg-primary py-2.5 text-sm font-medium text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {uploading ? 'Uploading…' : <span className="flex items-center justify-center gap-2"><Upload className="h-4 w-4" /> Upload</span>}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
