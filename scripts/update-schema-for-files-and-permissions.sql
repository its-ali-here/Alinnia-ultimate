-- Table to store metadata about uploaded files
CREATE TABLE IF NOT EXISTS uploaded_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    uploaded_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL UNIQUE, -- Path in Supabase Storage
    file_size_bytes BIGINT NOT NULL,
    file_type TEXT NOT NULL, -- e.g., 'text/csv', 'application/vnd.ms-excel'
    status TEXT NOT NULL DEFAULT 'uploading', -- 'uploading', 'processing', 'ready', 'error'
    row_count INTEGER,
    column_headers JSONB,
    processing_error TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Add RLS policies for uploaded_files (example)
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organizations can manage their own uploaded files"
ON uploaded_files
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM organization_members om
    WHERE om.organization_id = uploaded_files.organization_id
      AND om.user_id = auth.uid()
      AND (om.role = 'administrator' OR om.role = 'team_leader' OR uploaded_files.uploaded_by_user_id = auth.uid())
  )
);

CREATE POLICY "Users can insert their own uploaded files"
ON uploaded_files
FOR INSERT
WITH CHECK (uploaded_by_user_id = auth.uid());


-- Table for user-specific permissions (more granular than role-based for UI needs)
-- This replaces a potentially more complex role/permission mapping if PermissionsPage.tsx is the source of truth
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_type TEXT NOT NULL, -- e.g., 'accounts', 'transactions'
    can_read BOOLEAN NOT NULL DEFAULT FALSE,
    can_write BOOLEAN NOT NULL DEFAULT FALSE,
    can_delete BOOLEAN NOT NULL DEFAULT FALSE,
    granted_by_user_id UUID REFERENCES users(id), -- User who granted/updated this permission
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE (organization_id, user_id, permission_type)
);

-- Add RLS policies for user_permissions (example)
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and Team Leaders can manage permissions in their organization"
ON user_permissions
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM organization_members om
    WHERE om.organization_id = user_permissions.organization_id
      AND om.user_id = auth.uid()
      AND (om.role = 'administrator' OR om.role = 'team_leader')
  )
);

-- Trigger to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_uploaded_files_updated_at
BEFORE UPDATE ON uploaded_files
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_user_permissions_updated_at
BEFORE UPDATE ON user_permissions
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- Add 'invited_by' column to organization_members if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'organization_members' AND column_name = 'invited_by'
    ) THEN
        ALTER TABLE organization_members ADD COLUMN invited_by UUID REFERENCES users(id);
    END IF;
END $$;

-- Add 'joined_at' column to organization_members if it doesn't exist and set default
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'organization_members' AND column_name = 'joined_at'
    ) THEN
        ALTER TABLE organization_members ADD COLUMN joined_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
    END IF;
END $$;
