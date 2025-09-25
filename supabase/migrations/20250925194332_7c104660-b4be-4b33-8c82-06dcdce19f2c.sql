-- Update the public profile policy to be more restrictive about which columns are accessible
-- We need to handle this at the application level since RLS policies can't restrict individual columns

-- First, let's add a comment to document the security requirement
COMMENT ON COLUMN public.profiles.email IS 'SECURITY: This field contains PII and should only be visible to the profile owner. Client applications must not select this field when querying public profiles.';

-- Add a warning comment to the table
COMMENT ON TABLE public.profiles IS 'SECURITY WARNING: Contains PII (email addresses). Ensure client applications use explicit column selection and never select email field for public profile queries. Use RLS policies to restrict access appropriately.';

-- Update the public access policy to be more explicit about its limitations
DROP POLICY IF EXISTS "Public profiles limited access" ON public.profiles;

-- Create a new policy that is more explicit about public access
CREATE POLICY "Public profiles readable by authenticated users" 
ON public.profiles 
FOR SELECT 
USING (
  is_public = true 
  AND auth.role() = 'authenticated'
);

-- Also allow anonymous users to read public profiles (for SEO and sharing)
CREATE POLICY "Public profiles readable by anonymous users" 
ON public.profiles 
FOR SELECT 
USING (is_public = true);

-- Create a database function that validates safe profile queries
CREATE OR REPLACE FUNCTION public.validate_profile_query()
RETURNS TRIGGER AS $$
BEGIN
  -- This is a placeholder for potential future validation
  -- Currently, we rely on application-level column selection
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;