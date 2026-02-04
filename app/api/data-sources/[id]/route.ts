// app/api/data-sources/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Missing datasource ID' }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    
    // 1. Get the file path
    const { data, error } = await supabase
      .from('datasources')
      .select('id, file_name, storage_path')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching datasource:', error);
      return NextResponse.json({ error: 'Datasource not found.' }, { status: 404 });
    }

    // 2. Generate a SIGNED URL (Valid for 1 hour)
    // This allows access to Private buckets
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from('files') // Ensure this matches your bucket name
      .createSignedUrl(data.storage_path, 3600); // 3600 seconds = 1 hour

    if (signedUrlError || !signedUrlData?.signedUrl) {
        console.error('Error generating signed URL:', signedUrlError);
        return NextResponse.json({ error: 'Could not generate access link.' }, { status: 500 });
    }

    // 3. Return the data with the Secure URL
    return NextResponse.json({ 
        data: {
            ...data,
            file_url: signedUrlData.signedUrl
        } 
    });

  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}