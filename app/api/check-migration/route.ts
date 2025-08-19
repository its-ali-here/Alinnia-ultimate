import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient()

    // Check if our new tables exist
    const tableChecks = {
      google_sheets: false,
      dashboard_data_sources: false,
      sheet_data_cache: false,
      errors: [] as string[]
    }

    // Check google_sheets table
    try {
      const { data, error } = await supabase
        .from('google_sheets')
        .select('id')
        .limit(1)
      
      if (!error) {
        tableChecks.google_sheets = true
      } else {
        tableChecks.errors.push(`google_sheets: ${error.message}`)
      }
    } catch (e) {
      tableChecks.errors.push(`google_sheets: ${(e as Error).message}`)
    }

    // Check dashboard_data_sources table
    try {
      const { data, error } = await supabase
        .from('dashboard_data_sources')
        .select('id')
        .limit(1)
      
      if (!error) {
        tableChecks.dashboard_data_sources = true
      } else {
        tableChecks.errors.push(`dashboard_data_sources: ${error.message}`)
      }
    } catch (e) {
      tableChecks.errors.push(`dashboard_data_sources: ${(e as Error).message}`)
    }

    // Check sheet_data_cache table
    try {
      const { data, error } = await supabase
        .from('sheet_data_cache')
        .select('id')
        .limit(1)
      
      if (!error) {
        tableChecks.sheet_data_cache = true
      } else {
        tableChecks.errors.push(`sheet_data_cache: ${error.message}`)
      }
    } catch (e) {
      tableChecks.errors.push(`sheet_data_cache: ${(e as Error).message}`)
    }

    const allTablesExist = tableChecks.google_sheets && 
                          tableChecks.dashboard_data_sources && 
                          tableChecks.sheet_data_cache

    return NextResponse.json({
      migrationComplete: allTablesExist,
      tables: tableChecks,
      message: allTablesExist 
        ? 'All required tables exist' 
        : 'Migration required - some tables are missing',
      sqlToRun: allTablesExist ? null : `
-- Run this SQL in your Supabase SQL Editor:

-- Table to store Google Sheets metadata
CREATE TABLE IF NOT EXISTS google_sheets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    google_sheet_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    created_by UUID NOT NULL REFERENCES profiles(id),
    web_view_link TEXT,
    last_modified TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table for dashboard data sources
CREATE TABLE IF NOT EXISTS dashboard_data_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL CHECK (source_type IN ('csv', 'google_sheet')),
    source_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(dashboard_id, source_type, source_id)
);

-- Smart caching table for Google Sheets data
CREATE TABLE IF NOT EXISTS sheet_data_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    google_sheet_id TEXT NOT NULL REFERENCES google_sheets(google_sheet_id) ON DELETE CASCADE,
    range_name TEXT DEFAULT 'Sheet1',
    data JSONB NOT NULL,
    column_definitions JSONB,
    row_count INTEGER,
    last_fetched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '15 minutes'),
    UNIQUE(google_sheet_id, range_name)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_google_sheets_organization_id ON google_sheets(organization_id);
CREATE INDEX IF NOT EXISTS idx_google_sheets_google_sheet_id ON google_sheets(google_sheet_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_data_sources_dashboard_id ON dashboard_data_sources(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_data_sources_source ON dashboard_data_sources(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_sheet_data_cache_google_sheet_id ON sheet_data_cache(google_sheet_id);
CREATE INDEX IF NOT EXISTS idx_sheet_data_cache_expires_at ON sheet_data_cache(expires_at);

-- Migrate existing dashboard-datasource relationships
INSERT INTO dashboard_data_sources (dashboard_id, source_type, source_id)
SELECT id, 'csv', datasource_id 
FROM dashboards 
WHERE datasource_id IS NOT NULL
ON CONFLICT (dashboard_id, source_type, source_id) DO NOTHING;
      `
    })

  } catch (error) {
    console.error('Migration check error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check migration status',
        details: (error as Error).message 
      },
      { status: 500 }
    )
  }
}
