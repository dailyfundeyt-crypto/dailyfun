-- Create function to increment article views
CREATE OR REPLACE FUNCTION increment_article_views(article_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_articles
  SET views = COALESCE(views, 0) + 1
  WHERE id = article_id;
END;
$$;

-- Create function to update follower counts
CREATE OR REPLACE FUNCTION update_follower_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment follower count for followed user
    UPDATE profiles
    SET followers_count = COALESCE(followers_count, 0) + 1
    WHERE user_id = NEW.followed_user_id;
    
    -- Increment following count for follower
    UPDATE profiles
    SET following_count = COALESCE(following_count, 0) + 1
    WHERE user_id = NEW.follower_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement follower count for followed user
    UPDATE profiles
    SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0)
    WHERE user_id = OLD.followed_user_id;
    
    -- Decrement following count for follower
    UPDATE profiles
    SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0)
    WHERE user_id = OLD.follower_id;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create trigger for follower counts
DROP TRIGGER IF EXISTS update_follower_counts_trigger ON follows;
CREATE TRIGGER update_follower_counts_trigger
AFTER INSERT OR DELETE ON follows
FOR EACH ROW
EXECUTE FUNCTION update_follower_counts();