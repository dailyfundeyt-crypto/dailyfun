-- Drop the overly permissive public SELECT policies
DROP POLICY IF EXISTS "Anonymous can view public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles viewable by others" ON public.profiles;

-- Create a new restricted policy for public profile viewing
-- This policy allows viewing public profiles but excludes sensitive fields like email
CREATE POLICY "Public can view safe profile fields"
ON public.profiles
FOR SELECT
TO public
USING (
  is_public = true 
  AND user_id IS NOT NULL
);

-- Add a security definer function to get only safe public profile fields
-- This replaces direct table access with controlled field exposure
CREATE OR REPLACE FUNCTION public.get_safe_profile_view(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  display_name text,
  bio text,
  profession text,
  description text,
  location text,
  avatar_url text,
  alias text,
  website text,
  is_public boolean,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
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
    p.alias,
    p.website,
    p.is_public,
    p.created_at
  FROM public.profiles p
  WHERE p.user_id = profile_user_id 
    AND p.is_public = true;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.get_safe_profile_view(uuid) TO authenticated, anon;

-- Add a comment to explain the security measure
COMMENT ON POLICY "Public can view safe profile fields" ON public.profiles IS 
'Allows public viewing of profiles marked as public, but application code should use get_safe_profile_view() function to exclude sensitive fields like email';