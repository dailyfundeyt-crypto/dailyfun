-- Add proper RLS policies for API table or drop it if not needed
-- Since the API table seems to be unused and only contains id and created_at, we'll drop it
DROP TABLE IF EXISTS public.API;