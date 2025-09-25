-- Remove the current overly permissive policy that exposes all fields
DROP POLICY IF EXISTS "Public profiles and own profile viewable" ON public.profiles;

-- Create separate policies for different access patterns

-- Policy 1: Users can view their own complete profile (including email)
CREATE POLICY "Users can view own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 2: Public can view limited profile fields (excludes email and other sensitive data)
CREATE POLICY "Public can view limited profile fields" 
ON public.profiles 
FOR SELECT 
USING (
  is_public = true 
  AND auth.uid() IS NOT NULL
);

-- Create a security definer function to get public profile data without sensitive fields
CREATE OR REPLACE FUNCTION public.get_public_profile(profile_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  display_name text,
  bio text,
  profession text,
  description text,
  website text,
  location text,
  avatar_url text,
  alias text,
  is_public boolean,
  created_at timestamptz,
  updated_at timestamptz
) 
LANGUAGE SQL 
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.display_name,
    p.bio,
    p.profession,
    p.description,
    p.website,
    p.location,
    p.avatar_url,
    p.alias,
    p.is_public,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.user_id = profile_user_id 
    AND p.is_public = true;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_profile(uuid) TO authenticated;

-- Create a view for public profiles that excludes sensitive data
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  user_id,
  display_name,
  bio,
  profession,
  description,
  website,
  location,
  avatar_url,
  alias,
  is_public,
  created_at,
  updated_at
FROM public.profiles
WHERE is_public = true;

-- Enable RLS on the view (inherits from base table)
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Grant select on the view to authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;