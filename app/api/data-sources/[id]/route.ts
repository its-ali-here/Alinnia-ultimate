// app/api/data-sources/[id]/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

export async function GET(request: Request, { params }: { params?: { id: string } }) {
  const id = params?.id;

  if (!id) {
    return NextResponse.json({ error: 'Missing datasource ID' }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('datasources')
      .select('id, file_name, storage_path')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching datasource:', error);
      return NextResponse.json({ error: 'Datasource not found or error fetching.' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}