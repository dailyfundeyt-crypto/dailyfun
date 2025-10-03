-- Remove the email column from profiles table
-- Emails should only be stored in auth.users, not in the public profiles table
-- This prevents any possibility of email exposure through direct database queries

ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

COMMENT ON TABLE public.profiles IS 
'User profiles table. Email addresses are NOT stored here - they are managed securely in auth.users table. Always use auth.users for email-related queries.';