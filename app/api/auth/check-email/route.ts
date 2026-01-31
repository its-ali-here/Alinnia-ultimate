
import { createSupabaseServerClient } from '@/lib/supabase-server'
import {NextResponse} from 'next/server'

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from('organization_members')
      .select('email')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is not an error in this case
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ exists: !!data })
  } catch (error) {
    console.error('Error checking email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
