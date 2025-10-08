-- Create article templates table for saving and reusing article details
CREATE TABLE public.article_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  category text,
  category_en text,
  tags text[],
  author_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.article_templates ENABLE ROW LEVEL SECURITY;

-- Users can view their own templates
CREATE POLICY "Users can view their own templates" 
ON public.article_templates 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own templates
CREATE POLICY "Users can create their own templates" 
ON public.article_templates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own templates
CREATE POLICY "Users can update their own templates" 
ON public.article_templates 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own templates
CREATE POLICY "Users can delete their own templates" 
ON public.article_templates 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_article_templates_updated_at
BEFORE UPDATE ON public.article_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();