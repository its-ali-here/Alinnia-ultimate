-- Migration: Consolidate business_profiles into organizations table
-- This migration moves all business profile data into the organizations table
-- and removes the separate business_profiles table

-- Step 1: Add new columns to organizations table
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS business_type VARCHAR(100);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS business_description TEXT;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS business_metrics JSONB DEFAULT '{}';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS key_operations TEXT[] DEFAULT '{}';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS pain_points TEXT[] DEFAULT '{}';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS goals TEXT[] DEFAULT '{}';
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS onboarding_csv_path VARCHAR(500);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Step 2: Migrate existing data from business_profiles to organizations (if any exists)
-- This will only run if the business_profiles table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'business_profiles') THEN
        UPDATE organizations 
        SET 
            business_type = bp.business_type,
            business_description = bp.business_description,
            business_metrics = bp.business_metrics,
            key_operations = bp.key_operations,
            pain_points = bp.pain_points,
            goals = bp.goals,
            onboarding_csv_path = bp.onboarding_csv_path,
            onboarding_completed = bp.onboarding_completed
        FROM business_profiles bp 
        WHERE organizations.id = bp.organization_id;
        
        -- Log the migration
        RAISE NOTICE 'Migrated % business profiles to organizations table', 
            (SELECT COUNT(*) FROM business_profiles);
    END IF;
END $$;

-- Step 3: Drop the business_profiles table (if it exists)
DROP TABLE IF EXISTS business_profiles CASCADE;

-- Step 4: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_organizations_business_type ON organizations(business_type);
CREATE INDEX IF NOT EXISTS idx_organizations_onboarding_completed ON organizations(onboarding_completed);

-- Step 5: Add comments for documentation
COMMENT ON COLUMN organizations.business_type IS 'Type of business (e.g., healthcare_pharmacy, food_restaurant)';
COMMENT ON COLUMN organizations.business_description IS 'Detailed description of the business';
COMMENT ON COLUMN organizations.business_metrics IS 'JSON object containing business-specific metrics';
COMMENT ON COLUMN organizations.key_operations IS 'Array of key business operations';
COMMENT ON COLUMN organizations.pain_points IS 'Array of business pain points';
COMMENT ON COLUMN organizations.goals IS 'Array of business goals';
COMMENT ON COLUMN organizations.onboarding_csv_path IS 'Path to uploaded CSV file during onboarding';
COMMENT ON COLUMN organizations.onboarding_completed IS 'Whether the business onboarding process is complete';

-- Migration completed successfully
SELECT 'Business profiles consolidated into organizations table successfully' AS migration_status;
