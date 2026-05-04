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
    siteType,
    projectType,
    scopeOfWork,
    constructionPath,
    homeType,
    homeEra,
    contingencyPct,
    selectedPhases = [],
    isProjectUnderway = false,
    completedPhases = [],
    city,
    country,
    currency,
    hasDrawings = false,
    budget,
    startDate,
    timeline,
    uploadedFiles = [],
  } = body

  // Validate required fields
  if (!projectName || !budget || !timeline || !startDate) {
    return NextResponse.json({ message: 'Missing required project fields' }, { status: 400 })
  }

  const start = new Date(startDate)
  const end = new Date(start)
  end.setMonth(end.getMonth() + parseInt(timeline, 10))

  // ── 1. Create the project ────────────────────────────────────────────────
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name: projectName,
      budget: parseFloat(budget),
      start_date: start.toISOString(),
      end_date: end.toISOString(),
      status: isProjectUnderway ? 'in_progress' : 'planning',
      site_type: siteType || 'existing',
      project_type: projectType || 'residential',
      scope_of_work: scopeOfWork || null,
      construction_path: constructionPath || null,
      is_project_underway: isProjectUnderway,
      city: city || null,
      country: country || null,
      currency: currency || 'USD',
      has_drawings: hasDrawings,
      timeline_months: parseInt(timeline, 10),
      home_type: homeType || null,
      home_era: homeEra || null,
      contingency_pct: contingencyPct != null ? parseFloat(contingencyPct) : 15,
    })
    .select()
    .single()

  if (projectError) {
    console.error('Error creating project:', projectError.message)
    return NextResponse.json({ message: 'Could not create project.' }, { status: 500 })
  }

  // ── 2. Persist phase selections to project_phases ────────────────────────
  if (constructionPath && (selectedPhases.length > 0 || completedPhases.length > 0)) {
    // Look up all phase templates for this construction path ordered by order_index
    const { data: phaseTemplates, error: templateError } = await supabase
      .from('phase_templates')
      .select('id, order_index, phase_key')
      .eq('construction_path', constructionPath)
      .order('order_index', { ascending: true })

    if (!templateError && phaseTemplates && phaseTemplates.length > 0) {
      // Wizard phase IDs are like 'masonry-1', 'timber-3' — the trailing number is order_index
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
        // Non-fatal — project was created, phases just weren't linked
        console.error('Error saving project phases:', phasesError.message)
      }
    }
  }

  // ── 3. Record uploaded documents ─────────────────────────────────────────
  if (uploadedFiles.length > 0) {
    const documentsData = uploadedFiles.map((file: { path: string; name: string; fileType?: string }) => ({
      project_id: project.id,
      file_name: file.name,
      file_path: file.path,
      file_type: file.fileType || 'drawing',
      uploaded_by: user.id,
    }))

    const { error: docsError } = await supabase
      .from('documents')
      .insert(documentsData)

    if (docsError) {
      // Non-fatal
      console.error('Error saving documents:', docsError.message)
    }
  }

  return NextResponse.json(
    { message: 'Project created successfully', project },
    { status: 201 }
  )
}
