import type { SupabaseClient } from '@supabase/supabase-js'

export type FileType = 'drawing' | 'invoice' | 'receipt' | 'permit' | 'contract' | 'photo' | 'other'

export interface Project {
  id: string
  user_id: string
  name: string
  description: string | null
  budget: number
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold'
  start_date: string
  end_date: string | null
  site_type: string | null
  project_type: string | null
  construction_path: string | null
  scope_of_work: string | null
  is_project_underway: boolean
  has_basement: boolean
  city: string | null
  country: string | null
  total_area: number | null
  number_of_floors: number | null
  has_drawings: boolean
  timeline_months: number | null
  created_at: string
}

export interface Expense {
  id: string
  project_id: string
  phase_id: string | null
  task_id: string | null
  description: string
  amount: number
  date: string
  category: string
  vendor: string | null
  invoice_id: string | null
  unit_rate: number | null
  quantity: number | null
  unit: string | null
  created_at: string
}

export interface Phase {
  id: string
  project_id: string
  name: string
  description: string | null
  start_date: string
  end_date: string
  budget: number
  status: 'not_started' | 'in_progress' | 'completed'
  completion_percentage: number
}

export interface Task {
  id: string
  phase_id: string
  name: string
  description: string | null
  due_date: string
  status: 'todo' | 'in_progress' | 'done'
  assignee_id: string | null
  created_at: string
  // joined from phases
  category?: string
}

export interface ProjectPhaseWithTemplate {
  id: string
  project_id: string
  phase_template_id: string
  is_selected: boolean
  is_completed: boolean
  created_at: string
  phase_templates: {
    id: string
    construction_path: string
    phase_key: string
    name: string
    description: string | null
    order_index: number
  }
}

export interface Document {
  id: string
  project_id: string
  file_name: string
  file_path: string
  file_type: FileType
  uploaded_by: string
  uploaded_at: string
  created_at: string
}

export interface PriceIntelligence {
  id: string
  item_name: string
  item_type: 'material' | 'labor'
  unit: string
  price: number
  location: string
  updated_at: string
}

export async function getProjectExpenses(
  supabase: SupabaseClient,
  projectId: string
): Promise<Expense[]> {
  const { data } = await supabase
    .from('expenses')
    .select('*')
    .eq('project_id', projectId)
    .order('date', { ascending: false })
  return (data as Expense[]) ?? []
}

export async function getProjectTasks(
  supabase: SupabaseClient,
  projectId: string
): Promise<Task[]> {
  // tasks → phases → project
  const { data: phases } = await supabase
    .from('phases')
    .select('id')
    .eq('project_id', projectId)

  if (!phases || phases.length === 0) return []

  const phaseIds = phases.map((p: { id: string }) => p.id)
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .in('phase_id', phaseIds)
    .order('created_at', { ascending: false })

  return (tasks as Task[]) ?? []
}

export async function getProjectPhases(
  supabase: SupabaseClient,
  projectId: string
): Promise<ProjectPhaseWithTemplate[]> {
  const { data } = await supabase
    .from('project_phases')
    .select('*, phase_templates(*)')
    .eq('project_id', projectId)
    .order('phase_templates(order_index)', { ascending: true })

  return (data as ProjectPhaseWithTemplate[]) ?? []
}

export async function getProjectDocuments(
  supabase: SupabaseClient,
  projectId: string
): Promise<Document[]> {
  const { data } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .order('uploaded_at', { ascending: false })

  return (data as Document[]) ?? []
}

export async function searchPriceIntelligence(
  supabase: SupabaseClient,
  query: string,
  location?: string | null
): Promise<PriceIntelligence[]> {
  let q = supabase
    .from('price_intelligence')
    .select('*')
    .ilike('item_name', `%${query}%`)

  if (location) {
    // match project city, country, or 'Global'
    q = q.or(`location.ilike.%${location}%,location.ilike.Global`)
  }

  const { data } = await q.order('price', { ascending: true })
  return (data as PriceIntelligence[]) ?? []
}

// Ensure a "Punch List" phase exists for the project, creating one if needed
export async function ensurePunchListPhase(
  supabase: SupabaseClient,
  project: Project
): Promise<string | null> {
  const { data: existing } = await supabase
    .from('phases')
    .select('id')
    .eq('project_id', project.id)
    .eq('name', 'Punch List')
    .maybeSingle()

  if (existing) return existing.id

  const today = new Date().toISOString()
  const endDate = project.end_date ?? today

  const { data: created } = await supabase
    .from('phases')
    .insert({
      project_id: project.id,
      name: 'Punch List',
      description: 'Items requiring completion before handover',
      start_date: today,
      end_date: endDate,
      budget: 0,
      status: 'in_progress',
      completion_percentage: 0,
    })
    .select('id')
    .single()

  return created?.id ?? null
}
