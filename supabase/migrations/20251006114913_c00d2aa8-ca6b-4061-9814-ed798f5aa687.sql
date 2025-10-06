-- Create password_reset_codes table
CREATE TABLE public.password_reset_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  used boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own reset codes"
ON public.password_reset_codes
FOR SELECT
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Anyone can create reset codes"
ON public.password_reset_codes
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own reset codes"
ON public.password_reset_codes
FOR UPDATE
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Create index for better query performance
CREATE INDEX idx_password_reset_codes_email ON public.password_reset_codes(email);
CREATE INDEX idx_password_reset_codes_code ON public.password_reset_codes(code);
CREATE INDEX idx_password_reset_codes_expires_at ON public.password_reset_codes(expires_at);