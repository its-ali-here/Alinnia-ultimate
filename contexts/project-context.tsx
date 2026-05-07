"use client"

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import type { Project } from '@/lib/project-queries'

interface ProjectContextType {
  projects: Project[]
  activeProject: Project | null
  setActiveProject: (p: Project) => void
  loading: boolean
  refetch: () => Promise<void>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([])
      setActiveProject(null)
      setLoading(false)
      return
    }
    const supabase = createSupabaseBrowserClient()
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    let rows = (data as Project[]) ?? []

    // Link any pending anonymous project from the wizard flow
    if (rows.length === 0) {
      const pendingSessionId = typeof window !== 'undefined'
        ? localStorage.getItem('pendingSessionId')
        : null

      if (pendingSessionId) {
        const res = await fetch('/api/link-project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: pendingSessionId }),
        })
        if (res.ok) {
          localStorage.removeItem('pendingSessionId')
          // Refetch now that the project is linked
          const { data: linked } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
          rows = (linked as Project[]) ?? []
        }
      }
    }

    setProjects(rows)
    setActiveProject(prev => {
      if (prev && rows.some(r => r.id === prev.id)) {
        return rows.find(r => r.id === prev.id) ?? rows[0] ?? null
      }
      return rows[0] ?? null
    })
    setLoading(false)
  }, [user])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const value = useMemo<ProjectContextType>(
    () => ({ projects, activeProject, setActiveProject, loading, refetch: fetchProjects }),
    [projects, activeProject, loading, fetchProjects]
  )

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useActiveProject() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useActiveProject must be used inside ProjectProvider')
  return ctx
}
