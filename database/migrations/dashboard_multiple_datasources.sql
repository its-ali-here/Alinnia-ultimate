-- Migration: Support multiple data sources per dashboard
-- This migration modifies the dashboard structure to support multiple data sources

-- Step 1: Create a junction table for dashboard-datasource relationships
CREATE TABLE IF NOT EXISTS dashboard_datasources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dashboard_id UUID NOT NULL REFERENCES dashboards(id) ON DELETE CASCADE,
    datasource_id UUID NOT NULL REFERENCES datasources(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(dashboard_id, datasource_id)
);

-- Step 2: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_dashboard_datasources_dashboard_id ON dashboard_datasources(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_datasources_datasource_id ON dashboard_datasources(datasource_id);

-- Step 3: Migrate existing dashboard-datasource relationships
-- Move existing single datasource relationships to the junction table
INSERT INTO dashboard_datasources (dashboard_id, datasource_id)
SELECT id, datasource_id 
FROM dashboards 
WHERE datasource_id IS NOT NULL
ON CONFLICT (dashboard_id, datasource_id) DO NOTHING;

-- Step 4: Add a column to track Google Sheets data sources
-- Since Google Sheets aren't in the datasources table, we need to track them separately
ALTER TABLE dashboards ADD COLUMN IF NOT EXISTS google_sheets_ids TEXT[] DEFAULT '{}';

-- Step 5: Add comments for documentation
COMMENT ON TABLE dashboard_datasources IS 'Junction table linking dashboards to multiple data sources';
COMMENT ON COLUMN dashboard_datasources.dashboard_id IS 'Reference to the dashboard';
COMMENT ON COLUMN dashboard_datasources.datasource_id IS 'Reference to the data source (CSV files)';
COMMENT ON COLUMN dashboards.google_sheets_ids IS 'Array of Google Sheets IDs associated with this dashboard';

-- Step 6: We'll keep the old datasource_id column for backward compatibility
-- but mark it as deprecated in comments
COMMENT ON COLUMN dashboards.datasource_id IS 'DEPRECATED: Use dashboard_datasources table instead. Kept for backward compatibility.';

-- Migration completed successfully
SELECT 'Dashboard multiple datasources support added successfully' AS migration_status;
