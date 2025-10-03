-- Drop duplicate UPDATE policies on profiles table
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create a single, consolidated UPDATE policy
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Verify the policy allows updating all columns including description
COMMENT ON POLICY "Users can update their own profile" ON public.profiles IS 
'Allows authenticated users to update all fields in their own profile, including description, bio, display_name, etc.';