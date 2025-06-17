-- Add organization_code column if it doesn't exist and create function to generate codes
DO $$ 
BEGIN
    -- Add organization_code column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'organizations' AND column_name = 'organization_code') THEN
        ALTER TABLE organizations ADD COLUMN organization_code VARCHAR(6) UNIQUE;
    END IF;
END $$;

-- Create function to generate random 6-character codes
CREATE OR REPLACE FUNCTION generate_organization_code()
RETURNS VARCHAR(6) AS $$
DECLARE
    chars VARCHAR(36) := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result VARCHAR(6) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate organization codes
CREATE OR REPLACE FUNCTION set_organization_code()
RETURNS TRIGGER AS $$
DECLARE
    new_code VARCHAR(6);
    code_exists BOOLEAN;
BEGIN
    -- Only generate code if it's not already set
    IF NEW.organization_code IS NULL THEN
        LOOP
            new_code := generate_organization_code();
            
            -- Check if code already exists
            SELECT EXISTS(SELECT 1 FROM organizations WHERE organization_code = new_code) INTO code_exists;
            
            -- If code doesn't exist, use it
            IF NOT code_exists THEN
                NEW.organization_code := new_code;
                EXIT;
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_set_organization_code ON organizations;
CREATE TRIGGER trigger_set_organization_code
    BEFORE INSERT ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION set_organization_code();

-- Update existing organizations without codes
UPDATE organizations 
SET organization_code = generate_organization_code() 
WHERE organization_code IS NULL;
