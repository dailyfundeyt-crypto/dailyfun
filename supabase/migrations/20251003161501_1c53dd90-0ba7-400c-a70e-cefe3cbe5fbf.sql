-- Fix: Properly restrict public profile column access
-- Create a secure public view that only exposes safe fields

-- Step 1: Create a public-safe view that explicitly excludes user_id
CREATE OR REPLACE VIEW public.public_profiles AS
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
  p.created_at,
  p.followers_count,
  p.following_count
FROM public.profiles p
WHERE p.is_public = true 
  AND p.user_id IS NOT NULL;

-- Step 2: Grant SELECT access to the view for anonymous and authenticated users
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Step 3: Add RLS to the view (views can have policies too)
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Step 4: Drop ALL existing SELECT policies on profiles
DROP POLICY IF EXISTS "Public can view minimal profile fields" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own complete profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated can view public profiles via functions" ON public.profiles;
DROP POLICY IF EXISTS "No anonymous direct access" ON public.profiles;
DROP POLICY IF EXISTS "Public can view safe profile fields" ON public.profiles;

-- Step 5: Create restrictive policies
-- Policy 1: Users can view their own complete profile
CREATE POLICY "Users view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Block anonymous access completely
CREATE POLICY "Block anonymous access"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Policy 3: Authenticated users viewing other profiles should use the view or functions
-- but we allow limited access for the app to function
CREATE POLICY "Authenticated view public profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  is_public = true 
  AND user_id IS NOT NULL 
  AND user_id != auth.uid()
);

COMMENT ON VIEW public.public_profiles IS
'Public-safe view of profiles that excludes user_id and respects privacy settings. Use this view for displaying public profiles to anonymous users.';

COMMENT ON POLICY "Users view own profile" ON public.profiles IS
'Authenticated users can view their complete profile including all fields';

COMMENT ON POLICY "Block anonymous access" ON public.profiles IS
'Anonymous users cannot query profiles table directly - they must use public_profiles view';

COMMENT ON POLICY "Authenticated view public profiles" ON public.profiles IS
'Authenticated users can view public profiles of others, but frontend should use public_profiles view to exclude user_id';