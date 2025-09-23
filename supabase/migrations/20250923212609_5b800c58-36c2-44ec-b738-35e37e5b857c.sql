-- Remove the author profiles to eliminate duplicates
-- We'll use the static employee data instead which already works well
DELETE FROM public.profiles WHERE profile_type = 'author';