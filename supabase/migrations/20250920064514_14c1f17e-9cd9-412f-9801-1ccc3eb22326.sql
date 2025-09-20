-- Fix security issue: Replace overly permissive profile access policy
-- Remove the policy that allows everyone to view all profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create a secure policy that respects the is_public field
CREATE POLICY "Public profiles and own profile viewable" 
ON public.profiles 
FOR SELECT 
USING (
  -- Show public profiles to everyone, or allow users to see their own profile
  is_public = true OR auth.uid() = user_id
);