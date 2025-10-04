-- Add unique constraint for alias
ALTER TABLE public.profiles ADD CONSTRAINT profiles_alias_unique UNIQUE (alias);

-- Create function to generate random unique alias
CREATE OR REPLACE FUNCTION public.generate_unique_alias()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_alias text;
  alias_exists boolean;
BEGIN
  LOOP
    -- Generate random alias with format: user_XXXXX (where X is a random number)
    new_alias := 'user_' || LPAD(FLOOR(RANDOM() * 99999)::text, 5, '0');
    
    -- Check if alias already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE alias = new_alias) INTO alias_exists;
    
    -- Exit loop if alias is unique
    EXIT WHEN NOT alias_exists;
  END LOOP;
  
  RETURN new_alias;
END;
$$;

-- Update handle_new_user function to generate unique alias
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, alias, is_public)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', 'User'),
    public.generate_unique_alias(),
    true
  );
  RETURN NEW;
END;
$$;