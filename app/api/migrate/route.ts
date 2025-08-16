import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient()

    // Check if dashboard_datasources table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'dashboard_datasources')

    if (tableError) {
      console.error('Error checking table existence:', tableError)
      return NextResponse.json({ error: 'Failed to check table existence' }, { status: 500 })
    }

    if (tables && tables.length > 0) {
      return NextResponse.json({ message: 'Migration already completed' })
    }

    // Create dashboard_datasources table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create dashboard_datasources junction table
        CREATE TABLE IF NOT EXISTS dashboard_datasources (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
            datasource_id UUID NOT NULL REFERENCES datasources(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(dashboard_id, datasource_id)
        );

        -- Add indexes for performance
        CREATE INDEX IF NOT EXISTS idx_dashboard_datasources_dashboard_id ON dashboard_datasources(dashboard_id);
        CREATE INDEX IF NOT EXISTS idx_dashboard_datasources_datasource_id ON dashboard_datasources(datasource_id);

        -- Add Google Sheets support to dashboards table
        ALTER TABLE dashboards ADD COLUMN IF NOT EXISTS google_sheets_ids TEXT[] DEFAULT '{}';

        -- Add comments for documentation
        COMMENT ON TABLE dashboard_datasources IS 'Junction table linking dashboards to multiple data sources';
        COMMENT ON COLUMN dashboard_datasources.dashboard_id IS 'Reference to the dashboard';
        COMMENT ON COLUMN dashboard_datasources.datasource_id IS 'Reference to the data source (CSV files)';
        COMMENT ON COLUMN dashboards.google_sheets_ids IS 'Array of Google Sheets IDs associated with this dashboard';
      `
    })

    if (createError) {
      console.error('Migration error:', createError)
      return NextResponse.json({ error: 'Migration failed' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Migration completed successfully' })
  } catch (error) {
    console.error('Unexpected migration error:', error)
    return NextResponse.json({ error: 'Unexpected error during migration' }, { status: 500 })
  }
}
