-- Create table for article views (works for both static and user articles)
CREATE TABLE IF NOT EXISTS public.article_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id TEXT NOT NULL UNIQUE,
  view_count INTEGER NOT NULL DEFAULT 0,
  last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.article_views ENABLE ROW LEVEL SECURITY;

-- Anyone can view article view counts
CREATE POLICY "Anyone can view article views"
ON public.article_views
FOR SELECT
USING (true);

-- System can insert/update view counts (via function)
CREATE POLICY "System can manage article views"
ON public.article_views
FOR ALL
USING (true)
WITH CHECK (true);

-- Function to increment view count for any article
CREATE OR REPLACE FUNCTION increment_article_view_count(p_article_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Insert or update view count
  INSERT INTO article_views (article_id, view_count, last_viewed_at)
  VALUES (p_article_id, 1, now())
  ON CONFLICT (article_id)
  DO UPDATE SET
    view_count = article_views.view_count + 1,
    last_viewed_at = now(),
    updated_at = now()
  RETURNING view_count INTO v_count;
  
  RETURN v_count;
END;
$$;

-- Function to get view count for an article
CREATE OR REPLACE FUNCTION get_article_view_count(p_article_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT view_count INTO v_count
  FROM article_views
  WHERE article_id = p_article_id;
  
  RETURN COALESCE(v_count, 0);
END;
$$;