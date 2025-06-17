-- Add additional fields to organizations table
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS organization_code TEXT UNIQUE;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS country TEXT;

-- Create function to generate organization codes
CREATE OR REPLACE FUNCTION generate_org_code() RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        -- Generate a 6-character alphanumeric code
        code := upper(substring(md5(random()::text) from 1 for 6));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM public.organizations WHERE organization_code = code) INTO exists;
        
        -- If code doesn't exist, return it
        IF NOT exists THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update existing organizations to have codes
UPDATE public.organizations 
SET organization_code = generate_org_code() 
WHERE organization_code IS NULL;

-- Make organization_code required for new records
ALTER TABLE public.organizations ALTER COLUMN organization_code SET NOT NULL;
ALTER TABLE public.organizations ALTER COLUMN organization_code SET DEFAULT generate_org_code();
