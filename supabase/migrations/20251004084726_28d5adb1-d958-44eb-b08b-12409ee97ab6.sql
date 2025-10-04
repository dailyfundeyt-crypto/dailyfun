-- Add columns to track last change dates for name and alias
ALTER TABLE public.profiles 
ADD COLUMN last_name_change timestamp with time zone,
ADD COLUMN last_alias_change timestamp with time zone;