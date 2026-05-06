"use client"

import { useEffect, useRef, useState } from "react"
import { useActiveProject } from "@/contexts/project-context"
import { createSupabaseBrowserClient } from "@/lib/supabase"
import { getProjectImages } from "@/lib/project-queries"
import type { ProjectImage } from "@/lib/project-queries"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus } from "lucide-react"
import Image from "next/image"

type FilterTab = 'All' | 'Current' | 'Inspiration'

const TABS: FilterTab[] = ['All', 'Current', 'Inspiration']

export default function FilesPage() {
  const { activeProject } = useActiveProject()
  const supabase = createSupabaseBrowserClient()
  const [images, setImages] = useState<ProjectImage[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('All')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingType, setPendingType] = useState<'current' | 'inspiration'>('current')

  const loadImages = async () => {
    if (!activeProject) return
    const data = await getProjectImages(supabase, activeProject.id)
    setImages(data)
    setLoading(false)
  }

  useEffect(() => { setLoading(true); loadImages() }, [activeProject]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeProject) return

    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    fd.append("image_type", pendingType)

    try {
      const res = await fetch("/api/images/upload", { method: "POST", body: fd })
      if (!res.ok) return
      const { path } = await res.json()

      const { error } = await supabase.from("project_images").insert({
        project_id: activeProject.id,
        image_type: pendingType,
        storage_path: path,
        display_order: images.length,
      })

      if (!error) await loadImages()
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const getPublicUrl = (path: string) => {
    const { data } = supabase.storage.from("project-images").getPublicUrl(path)
    return data.publicUrl
  }

  const visible = activeTab === 'All'
    ? images
    : images.filter(img => img.image_type === activeTab.toLowerCase())

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 rounded-lg" />
        <div className="grid grid-cols-3 gap-2.5">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-28 rounded-lg" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                activeTab === tab ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setPendingType('current'); fileInputRef.current?.click() }}
            disabled={uploading}
            className="text-[11px] px-3 py-1.5 rounded-[8px] border border-border bg-card hover:bg-muted transition-colors disabled:opacity-50"
          >
            + Current photo
          </button>
          <button
            onClick={() => { setPendingType('inspiration'); fileInputRef.current?.click() }}
            disabled={uploading}
            className="text-[11px] px-3 py-1.5 rounded-[8px] bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50"
          >
            + Inspiration photo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {visible.map(img => (
          <div key={img.id} className="relative group rounded-[12px] overflow-hidden border border-border aspect-[4/3] bg-muted">
            <Image
              src={getPublicUrl(img.storage_path)}
              alt={img.image_type}
              fill
              className="object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 px-2 py-1.5 bg-gradient-to-t from-black/60 to-transparent">
              <span className="text-[10px] text-white font-medium capitalize">{img.image_type}</span>
            </div>
          </div>
        ))}

        {visible.length === 0 && (
          <div className="col-span-3 py-16 text-center text-[13px] text-muted-foreground">
            No {activeTab === 'All' ? '' : activeTab.toLowerCase() + ' '}photos yet
          </div>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
    </div>
  )
}
