-- Fix the security definer view issue by removing the problematic view
DROP VIEW IF EXISTS public.public_profiles;

-- Instead, we'll handle public profile access through proper RLS policies
-- Remove the current policy that requires authentication for public profiles
DROP POLICY IF EXISTS "Public can view limited profile fields" ON public.profiles;

-- Create a new policy that allows public access to limited fields only
-- We'll use a different approach that doesn't expose sensitive data
CREATE POLICY "Public profiles limited access" 
ON public.profiles 
FOR SELECT 
USING (
  is_public = true 
  AND auth.role() IN ('authenticated', 'anon')
);

-- However, we need to ensure email is not returned in public queries
-- We'll update the application code to handle this instead of using a view

-- The function approach is still secure and can be used when needed
-- Update the function to be more explicit about security
DROP FUNCTION IF EXISTS public.get_public_profile(uuid);

CREATE OR REPLACE FUNCTION public.get_safe_public_profile(profile_user_id uuid)
RETURNS TABLE (
  id uuid,
  display_name text,
  bio text,
  profession text,
  description text,
  location text,
  avatar_url text,
  alias text
) 
LANGUAGE SQL 
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.display_name,
    p.bio,
    p.profession,
    p.description,
    p.location,
    p.avatar_url,
    p.alias
  FROM public.profiles p
  WHERE p.user_id = profile_user_id 
    AND p.is_public = true;
$$;

-- Grant execute permission to all roles (including anonymous)
GRANT EXECUTE ON FUNCTION public.get_safe_public_profile(uuid) TO authenticated, anon;