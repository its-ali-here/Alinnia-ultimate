-- Google Sheets Integration Migration
-- Run this in your Supabase SQL Editor

-- 1. Create google_sheets table to store Google Sheets metadata
CREATE TABLE IF NOT EXISTS google_sheets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    google_sheet_id TEXT NOT NULL UNIQUE, -- The actual Google Sheets ID from Google
    name TEXT NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    created_by UUID NOT NULL REFERENCES profiles(id),
    web_view_link TEXT,
    last_modified TIMESTAMP WITH TIME ZONE, -- From Google Sheets API
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create junction table for dashboard data sources (supports both CSV and Google Sheets)
CREATE TABLE IF NOT EXISTS dashboard_data_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL CHECK (source_type IN ('csv', 'google_sheet')),
    source_id UUID NOT NULL, -- References either datasources.id or google_sheets.id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(dashboard_id, source_type, source_id)
);

-- 3. Create smart caching table for Google Sheets data
CREATE TABLE IF NOT EXISTS sheet_data_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    google_sheet_id TEXT NOT NULL REFERENCES google_sheets(google_sheet_id) ON DELETE CASCADE,
    range_name TEXT DEFAULT 'Sheet1', -- For specific ranges like 'A1:Z1000'
    data JSONB NOT NULL,
    column_definitions JSONB, -- Similar to datasources table
    row_count INTEGER,
    last_fetched TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '15 minutes'),
    UNIQUE(google_sheet_id, range_name)
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_google_sheets_organization_id ON google_sheets(organization_id);
CREATE INDEX IF NOT EXISTS idx_google_sheets_google_sheet_id ON google_sheets(google_sheet_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_data_sources_dashboard_id ON dashboard_data_sources(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_data_sources_source ON dashboard_data_sources(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_sheet_data_cache_google_sheet_id ON sheet_data_cache(google_sheet_id);
CREATE INDEX IF NOT EXISTS idx_sheet_data_cache_expires_at ON sheet_data_cache(expires_at);

-- 5. Migrate existing dashboard-datasource relationships
INSERT INTO dashboard_data_sources (dashboard_id, source_type, source_id)
SELECT id, 'csv', datasource_id 
FROM dashboards 
WHERE datasource_id IS NOT NULL
ON CONFLICT (dashboard_id, source_type, source_id) DO NOTHING;

-- 6. Add comments for documentation
COMMENT ON TABLE google_sheets IS 'Metadata for connected Google Sheets';
COMMENT ON TABLE dashboard_data_sources IS 'Junction table linking dashboards to multiple data sources (CSV files and Google Sheets)';
COMMENT ON TABLE sheet_data_cache IS 'Smart cache for Google Sheets data with expiration';
COMMENT ON COLUMN google_sheets.google_sheet_id IS 'The actual Google Sheets ID from Google Drive API';
COMMENT ON COLUMN dashboard_data_sources.source_type IS 'Type of data source: csv or google_sheet';
COMMENT ON COLUMN dashboard_data_sources.source_id IS 'References either datasources.id or google_sheets.id based on source_type';

-- 7. Verification query
SELECT 
    'Migration completed successfully' as status,
    (SELECT COUNT(*) FROM google_sheets) as google_sheets_count,
    (SELECT COUNT(*) FROM dashboard_data_sources) as relationships_migrated,
    (SELECT COUNT(*) FROM sheet_data_cache) as cache_entries,
    NOW() as completed_at;
