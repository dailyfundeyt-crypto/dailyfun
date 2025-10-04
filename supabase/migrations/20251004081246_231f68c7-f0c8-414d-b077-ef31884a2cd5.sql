-- Allow anonymous users to view public profiles
CREATE POLICY "Anonymous users can view public profiles"
ON public.profiles
FOR SELECT
TO anon
USING (is_public = true);

-- Update the blocking policy to only block authenticated users from seeing non-public profiles
DROP POLICY IF EXISTS "Block anonymous access" ON public.profiles;

CREATE POLICY "Block non-public profile access"
ON public.profiles
FOR SELECT
TO anon
USING (is_public = true);