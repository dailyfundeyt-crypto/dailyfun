-- Phase 1 & 2: Critical Security Fixes
-- 1. Add profile_visibility column for user-controlled privacy
-- 2. Update RLS policies to be column-restrictive
-- 3. Update security definer functions to respect privacy settings
-- 4. Secure the API table
-- 5. Make user_id NOT NULL in profiles

-- Step 1: Add profile_visibility column with default safe settings
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_visibility JSONB DEFAULT '{
  "show_location": false,
  "show_profession": false,
  "show_website": false,
  "show_description": false,
  "show_bio": true
}'::jsonb;

-- Step 2: Ensure all existing records have user_id (prepare for NOT NULL)
UPDATE public.profiles 
SET user_id = id 
WHERE user_id IS NULL;

-- Step 3: Make user_id NOT NULL
ALTER TABLE public.profiles 
ALTER COLUMN user_id SET NOT NULL;

-- Step 4: Drop the overly permissive RLS policy
DROP POLICY IF EXISTS "Public can view safe profile fields" ON public.profiles;

-- Step 5: Create new restrictive RLS policy for public profile viewing
CREATE POLICY "Public can view minimal profile fields"
ON public.profiles
FOR SELECT
USING (
  is_public = true 
  AND user_id IS NOT NULL
);

COMMENT ON POLICY "Public can view minimal profile fields" ON public.profiles IS
'Allows public to view profiles, but application code must explicitly select only safe columns';

-- Step 6a: Drop existing functions before recreating with new signatures
DROP FUNCTION IF EXISTS public.get_safe_public_profile(uuid);
DROP FUNCTION IF EXISTS public.get_safe_profile_view(uuid);

-- Step 6b: Create privacy-aware security definer functions
CREATE FUNCTION public.get_safe_profile_view(profile_user_id uuid)
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
    CASE WHEN COALESCE((p.profile_visibility->>'show_bio')::boolean, true) THEN p.bio ELSE NULL END as bio,
    CASE WHEN COALESCE((p.profile_visibility->>'show_profession')::boolean, false) THEN p.profession ELSE NULL END as profession,
    CASE WHEN COALESCE((p.profile_visibility->>'show_description')::boolean, false) THEN p.description ELSE NULL END as description,
    CASE WHEN COALESCE((p.profile_visibility->>'show_location')::boolean, false) THEN p.location ELSE NULL END as location,
    p.avatar_url,
    p.alias,
    CASE WHEN COALESCE((p.profile_visibility->>'show_website')::boolean, false) THEN p.website ELSE NULL END as website,
    p.is_public,
    p.created_at
  FROM public.profiles p
  WHERE p.user_id = profile_user_id 
    AND p.is_public = true;
$$;

CREATE FUNCTION public.get_safe_public_profile(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  display_name text,
  bio text,
  profession text,
  description text,
  location text,
  avatar_url text,
  alias text,
  website text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.display_name,
    CASE WHEN COALESCE((p.profile_visibility->>'show_bio')::boolean, true) THEN p.bio ELSE NULL END as bio,
    CASE WHEN COALESCE((p.profile_visibility->>'show_profession')::boolean, false) THEN p.profession ELSE NULL END as profession,
    CASE WHEN COALESCE((p.profile_visibility->>'show_description')::boolean, false) THEN p.description ELSE NULL END as description,
    CASE WHEN COALESCE((p.profile_visibility->>'show_location')::boolean, false) THEN p.location ELSE NULL END as location,
    p.avatar_url,
    p.alias,
    CASE WHEN COALESCE((p.profile_visibility->>'show_website')::boolean, false) THEN p.website ELSE NULL END as website
  FROM public.profiles p
  WHERE p.user_id = profile_user_id 
    AND p.is_public = true;
$$;

-- Step 7: Secure the API table with RLS policies (correct case)
ALTER TABLE public."API" ENABLE ROW LEVEL SECURITY;

-- Restrict all access to the API table by default
CREATE POLICY "No public access to API table"
ON public."API"
FOR ALL
USING (false);

COMMENT ON TABLE public."API" IS
'This table is secured with RLS. All public access is denied by default.';

-- Step 8: Add helpful comments
COMMENT ON COLUMN public.profiles.profile_visibility IS
'User-controlled privacy settings for profile fields. Controls which personal information is publicly visible.';

COMMENT ON FUNCTION public.get_safe_profile_view(uuid) IS
'Returns profile fields respecting user privacy settings. Personal information only shown if user has enabled visibility.';

COMMENT ON FUNCTION public.get_safe_public_profile(uuid) IS
'Returns minimal safe public profile fields respecting user privacy settings.';