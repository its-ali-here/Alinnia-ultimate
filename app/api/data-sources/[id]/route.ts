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
    
    // 1. Get the file path from the database
    const { data, error } = await supabase
      .from('datasources')
      .select('id, file_name, storage_path')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('Error fetching datasource record:', error);
      return NextResponse.json({ error: 'Datasource record not found in database.' }, { status: 404 });
    }

    // 2. Generate a secure Signed URL (valid for 1 hour)
    // We use your correct bucket name: 'files'
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from('files') 
      .createSignedUrl(data.storage_path, 3600);

    if (signedUrlError || !signedUrlData) {
      console.error('Error generating signed URL:', signedUrlError);
      // We return the data anyway, but file_url will be missing
      return NextResponse.json({ data }); 
    }

    // 3. Return the Signed URL as 'file_url'
    return NextResponse.json({ 
        data: {
            ...data,
            file_url: signedUrlData.signedUrl 
        } 
    });

  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}