-- Add parent_comment_id for threaded comments (replies)
ALTER TABLE article_comments 
ADD COLUMN parent_comment_id uuid REFERENCES article_comments(id) ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX idx_article_comments_parent ON article_comments(parent_comment_id);
CREATE INDEX idx_article_comments_article ON article_comments(article_id);

-- Create comment_notifications table
CREATE TABLE comment_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid NOT NULL REFERENCES article_comments(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL, -- User who should receive the notification
  is_read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on comment_notifications
ALTER TABLE comment_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON comment_notifications
FOR SELECT
USING (auth.uid() = recipient_id);

-- Users can update their own notifications
CREATE POLICY "Users can update their own notifications"
ON comment_notifications
FOR UPDATE
USING (auth.uid() = recipient_id);

-- System can create notifications
CREATE POLICY "System can create notifications"
ON comment_notifications
FOR INSERT
WITH CHECK (true);

-- Add index for notifications
CREATE INDEX idx_comment_notifications_recipient ON comment_notifications(recipient_id, is_read);

-- Function to create notification when reply is made
CREATE OR REPLACE FUNCTION create_comment_reply_notification()
RETURNS TRIGGER AS $$
DECLARE
  parent_author_id uuid;
  article_author_id uuid;
BEGIN
  -- If this is a reply to another comment
  IF NEW.parent_comment_id IS NOT NULL THEN
    -- Get the author of the parent comment
    SELECT user_id INTO parent_author_id
    FROM article_comments
    WHERE id = NEW.parent_comment_id;
    
    -- Create notification for parent comment author (if not replying to own comment)
    IF parent_author_id IS NOT NULL AND parent_author_id != NEW.user_id THEN
      INSERT INTO comment_notifications (comment_id, recipient_id)
      VALUES (NEW.id, parent_author_id);
    END IF;
  END IF;
  
  -- Always notify article author about new comments (if not their own comment)
  -- Check if article exists in user_articles
  SELECT user_id INTO article_author_id
  FROM user_articles
  WHERE id::text = NEW.article_id;
  
  IF article_author_id IS NOT NULL AND article_author_id != NEW.user_id THEN
    -- Only create notification if one doesn't already exist
    INSERT INTO comment_notifications (comment_id, recipient_id)
    VALUES (NEW.id, article_author_id)
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for comment notifications
CREATE TRIGGER trigger_comment_reply_notification
AFTER INSERT ON article_comments
FOR EACH ROW
EXECUTE FUNCTION create_comment_reply_notification();

-- Add updated_at trigger for comment_notifications
CREATE TRIGGER update_comment_notifications_updated_at
BEFORE UPDATE ON comment_notifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();