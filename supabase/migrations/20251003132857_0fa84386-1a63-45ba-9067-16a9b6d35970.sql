-- Update security definer functions to exclude user_id from public profile views
-- This prevents user_id (internal auth identifier) from being exposed publicly

-- Update get_safe_profile_view to exclude user_id
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

-- Update get_safe_public_profile to exclude user_id
CREATE OR REPLACE FUNCTION public.get_safe_public_profile(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  display_name text,
  bio text,
  profession text,
  description text,
  location text,
  avatar_url text,
  alias text
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
    p.alias
  FROM public.profiles p
  WHERE p.user_id = profile_user_id 
    AND p.is_public = true;
$$;

COMMENT ON FUNCTION public.get_safe_profile_view(uuid) IS 
'Returns safe public profile fields excluding user_id to prevent internal user enumeration';

COMMENT ON FUNCTION public.get_safe_public_profile(uuid) IS 
'Returns minimal safe public profile fields excluding user_id to prevent internal user enumeration';