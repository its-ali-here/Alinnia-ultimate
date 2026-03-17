// /app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const projectData = await request.json();

  // Basic validation
  if (!projectData.projectName || !projectData.budget || !projectData.timeline) {
    return NextResponse.json({ message: 'Missing required project fields' }, { status: 400 });
  }

  const { projectName, budget, timeline } = projectData;

  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(startDate.getMonth() + parseInt(timeline, 10));

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name: projectName,
      budget: parseFloat(budget),
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      // You can add other fields from projectData here as needed
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error.message);
    return NextResponse.json({ message: 'Could not create project.' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Project created successfully', project: data }, { status: 201 });
}
