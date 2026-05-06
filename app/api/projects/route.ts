import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  const {
    projectName,
    roomType,
    homeType,
    zipCode,
    city,
    country,
    currency,
    budget,
    totalArea,
    inspirationText,
    // Legacy wizard fields (kept for backwards compat during transition)
    constructionPath,
    selectedPhases = [],
    completedPhases = [],
  } = body

  if (!projectName || !budget) {
    return NextResponse.json({ message: 'Missing required project fields' }, { status: 400 })
  }

  // ── 1. Create the project ────────────────────────────────────────────────
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name: projectName,
      budget: parseFloat(budget),
      status: 'planning',
      room_type: roomType || constructionPath || null,
      zip_code: zipCode || null,
      city: city || null,
      country: country || null,
      currency: currency || 'USD',
      total_area: totalArea ?? null,
      home_type: homeType || null,
      inspiration_text: inspirationText || null,
    })
    .select()
    .single()

  if (projectError) {
    console.error('Error creating project:', projectError.message)
    return NextResponse.json({ message: 'Could not create project.' }, { status: 500 })
  }

  // ── 2. Link phase templates if a construction path was given ─────────────
  if (constructionPath && (selectedPhases.length > 0 || completedPhases.length > 0)) {
    const { data: phaseTemplates, error: templateError } = await supabase
      .from('phase_templates')
      .select('id, order_index, phase_key')
      .eq('construction_path', constructionPath)
      .order('order_index', { ascending: true })

    if (!templateError && phaseTemplates && phaseTemplates.length > 0) {
      const getOrder = (phaseId: string) =>
        parseInt(phaseId.split('-').pop() ?? '0', 10)

      const projectPhasesData = phaseTemplates.map(template => ({
        project_id: project.id,
        phase_template_id: template.id,
        is_selected: selectedPhases.some(
          (id: string) => getOrder(id) === template.order_index
        ),
        is_completed: completedPhases.some(
          (id: string) => getOrder(id) === template.order_index
        ),
      }))

      const { error: phasesError } = await supabase
        .from('project_phases')
        .insert(projectPhasesData)

      if (phasesError) {
        console.error('Error saving project phases:', phasesError.message)
      }
    }
  }

  return NextResponse.json(
    { message: 'Project created successfully', project },
    { status: 201 }
  )
}
