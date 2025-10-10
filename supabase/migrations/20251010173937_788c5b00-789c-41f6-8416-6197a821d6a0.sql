-- Create article_comments table for public comments on articles
CREATE TABLE IF NOT EXISTS public.article_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id text NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.article_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for article_comments
CREATE POLICY "Anyone can view comments"
ON public.article_comments
FOR SELECT
USING (true);

CREATE POLICY "Users can create comments"
ON public.article_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.article_comments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.article_comments
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_article_comments_article_id ON public.article_comments(article_id);
CREATE INDEX IF NOT EXISTS idx_article_comments_user_id ON public.article_comments(user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_article_comments_updated_at
BEFORE UPDATE ON public.article_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for article_comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.article_comments;