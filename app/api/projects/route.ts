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
    city,
    country,
    currency,
    budget,
    totalArea,
    inspirationText,
  } = body

  if (!projectName || !budget) {
    return NextResponse.json({ message: 'Missing required project fields' }, { status: 400 })
  }

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name: projectName,
      budget: parseFloat(budget),
      status: 'planning',
      room_type: roomType || null,
      city: city || null,
      country: country || null,
      currency: currency || 'GBP',
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

  return NextResponse.json(
    { message: 'Project created successfully', project },
    { status: 201 }
  )
}
