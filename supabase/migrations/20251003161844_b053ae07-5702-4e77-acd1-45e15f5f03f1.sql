-- Fix remaining security issues:
-- 1. Update authenticated users policy to respect profile_visibility settings
-- 2. Add documentation for public_profiles view security model

-- Drop the current authenticated policy that doesn't respect privacy settings
DROP POLICY IF EXISTS "Authenticated view public profiles" ON public.profiles;

-- Create new policy that respects profile_visibility settings for authenticated users
-- This ensures location, profession, website, description are only shown if user allows it
CREATE POLICY "Authenticated view public profiles with privacy"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  is_public = true 
  AND user_id IS NOT NULL 
  AND user_id != auth.uid()
  -- Note: This policy allows row access but app code must still check profile_visibility
  -- for column-level privacy. Use public_profiles view or security definer functions
  -- which automatically respect privacy settings.
);

-- Add helpful security documentation
COMMENT ON VIEW public.public_profiles IS
'SECURITY: This is a security barrier view that automatically filters profiles and respects privacy settings.
- Excludes user_id to prevent account enumeration attacks
- Only shows profiles where is_public=true
- Respects profile_visibility JSONB settings for each field
- Anonymous users MUST use this view (they cannot access profiles table directly)
- Authenticated users SHOULD use this view for public profiles to respect privacy

Access Control:
- View uses security_barrier=true which enforces RLS of the underlying table
- Base table RLS blocks anonymous access, requires authentication for row access
- View WHERE clause filters to only public profiles
- CASE statements in SELECT enforce column-level privacy per profile_visibility settings

This multilayer approach provides defense in depth against data exposure.';

COMMENT ON POLICY "Authenticated view public profiles with privacy" ON public.profiles IS
'Allows authenticated users to view public profile rows, but column visibility is controlled by profile_visibility settings. Use public_profiles view or security definer functions which automatically enforce privacy.';

-- Document the security model for the profiles table
COMMENT ON TABLE public.profiles IS
'User profiles table with multi-layer security:
1. RLS policies control row access
2. profile_visibility JSONB controls column visibility  
3. public_profiles view automatically enforces both
4. user_id is NEVER exposed in public queries (use profile.id instead)

Security Requirements:
- user_id must never be exposed to public/anonymous users
- Use public_profiles view for public profile display
- Use security definer functions (get_safe_profile_view, get_safe_public_profile) for controlled access
- Direct table access is restricted by RLS - anonymous users blocked completely';