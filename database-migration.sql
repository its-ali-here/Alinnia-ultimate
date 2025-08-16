-- Database Migration for Dashboard Multi-Source Support
-- Run this in your Supabase SQL Editor

-- Step 1: Add Google Sheets support to dashboards table
ALTER TABLE dashboards ADD COLUMN IF NOT EXISTS google_sheets_ids TEXT[] DEFAULT '{}';

-- Step 2: Create dashboard_datasources junction table
CREATE TABLE IF NOT EXISTS dashboard_datasources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    datasource_id UUID NOT NULL REFERENCES datasources(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(dashboard_id, datasource_id)
);

-- Step 3: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_dashboard_datasources_dashboard_id ON dashboard_datasources(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_datasources_datasource_id ON dashboard_datasources(datasource_id);

-- Step 4: Migrate existing dashboard-datasource relationships
-- Move existing single datasource relationships to the junction table
INSERT INTO dashboard_datasources (dashboard_id, datasource_id)
SELECT id, datasource_id 
FROM dashboards 
WHERE datasource_id IS NOT NULL
ON CONFLICT (dashboard_id, datasource_id) DO NOTHING;

-- Step 5: Add comments for documentation
COMMENT ON TABLE dashboard_datasources IS 'Junction table linking dashboards to multiple data sources';
COMMENT ON COLUMN dashboard_datasources.dashboard_id IS 'Reference to the dashboard';
COMMENT ON COLUMN dashboard_datasources.datasource_id IS 'Reference to the data source (CSV files)';
COMMENT ON COLUMN dashboards.google_sheets_ids IS 'Array of Google Sheets IDs associated with this dashboard';
COMMENT ON COLUMN dashboards.datasource_id IS 'DEPRECATED: Use dashboard_datasources table instead. Kept for backward compatibility.';

-- Step 6: Verify the migration
SELECT 
    'Migration completed successfully' as status,
    (SELECT COUNT(*) FROM dashboard_datasources) as relationships_migrated,
    (SELECT COUNT(*) FROM dashboards WHERE google_sheets_ids IS NOT NULL) as dashboards_with_google_sheets_support;
