-- Create security questions table
CREATE TABLE IF NOT EXISTS public.security_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  question text NOT NULL,
  answer_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_security_questions_user ON public.security_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_security_questions_email ON public.security_questions(LOWER(email));

-- Ensure a user cannot have duplicate question texts
ALTER TABLE public.security_questions
  ADD CONSTRAINT unique_user_question UNIQUE (user_id, question);

-- Enable RLS
ALTER TABLE public.security_questions ENABLE ROW LEVEL SECURITY;

-- Policies: users manage only their own records
CREATE POLICY "Users can select their own security questions"
  ON public.security_questions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own security questions"
  ON public.security_questions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own security questions"
  ON public.security_questions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own security questions"
  ON public.security_questions
  FOR DELETE
  USING (auth.uid() = user_id);
