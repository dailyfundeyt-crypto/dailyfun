-- Create user_articles table
CREATE TABLE public.user_articles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  title_en text,
  excerpt text NOT NULL,
  excerpt_en text,
  content text NOT NULL,
  content_en text,
  image_url text,
  video_url text,
  category text NOT NULL,
  category_en text,
  author_name text NOT NULL,
  published_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  tags text[],
  views integer DEFAULT 0,
  is_published boolean DEFAULT true,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.user_articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view published articles"
ON public.user_articles
FOR SELECT
USING (is_published = true);

CREATE POLICY "Users can view their own articles"
ON public.user_articles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own articles"
ON public.user_articles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own articles"
ON public.user_articles
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own articles"
ON public.user_articles
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_articles_updated_at
BEFORE UPDATE ON public.user_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_user_articles_user_id ON public.user_articles(user_id);
CREATE INDEX idx_user_articles_published_at ON public.user_articles(published_at DESC);
CREATE INDEX idx_user_articles_author_name ON public.user_articles(author_name);