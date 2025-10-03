-- Fix the handle_new_user trigger to prevent email addresses from being used as display names
-- This ensures no email addresses are exposed publicly through the display_name field
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, is_public)
  VALUES (
    NEW.id, 
    -- Never use email as fallback - use a generic "User" instead
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', 'User'),
    true
  );
  RETURN NEW;
END;
$function$;

-- Optional: Update existing profiles where display_name appears to be an email address
-- This sanitizes existing data to prevent email exposure
UPDATE public.profiles
SET display_name = 'User'
WHERE display_name LIKE '%@%.%' 
  AND display_name = email
  OR (email IS NULL AND display_name LIKE '%@%.%');

COMMENT ON FUNCTION public.handle_new_user() IS 
'Creates a profile for new users. Never uses email as display_name to prevent exposing personal contact information publicly.';