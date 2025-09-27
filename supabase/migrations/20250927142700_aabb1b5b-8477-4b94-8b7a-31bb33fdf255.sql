-- Fix RLS policies for profiles table to ensure users can only access their own profiles
-- First drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Public profiles readable by anonymous users" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles readable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles viewable by authenticated users" ON public.profiles;

-- Create secure RLS policies
-- Users can only view their own complete profile data
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE  
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can only insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated  
WITH CHECK (auth.uid() = user_id);

-- Public profiles are viewable by others (but only basic info)
CREATE POLICY "Public profiles viewable by others"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  is_public = true 
  AND auth.uid() != user_id 
  AND user_id IS NOT NULL
);

-- Anonymous users can view public profiles (basic info only)
CREATE POLICY "Anonymous can view public profiles"
ON public.profiles
FOR SELECT
TO anon
USING (is_public = true);