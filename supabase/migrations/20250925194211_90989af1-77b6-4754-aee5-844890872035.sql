-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Public profiles and own profile viewable" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own complete profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view limited profile fields" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new secure policies

-- Policy 1: Users can view their own complete profile (including email)
CREATE POLICY "Users can view own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy 2: Authenticated users can view public profiles but WITHOUT sensitive fields like email
-- This policy will be restricted by the application logic to exclude email
CREATE POLICY "Public profiles viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
USING (
  is_public = true 
  AND auth.uid() IS NOT NULL
  AND auth.uid() != user_id  -- Don't apply this policy to own profile
);

-- Policy 3: Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

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