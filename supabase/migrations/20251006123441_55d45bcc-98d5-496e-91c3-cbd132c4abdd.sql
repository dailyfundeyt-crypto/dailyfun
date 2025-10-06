-- Add followed_user_id column to follows table (nullable first)
ALTER TABLE follows ADD COLUMN IF NOT EXISTS followed_user_id uuid;

-- Migrate existing data: try to map author names to user_ids via profiles
UPDATE follows 
SET followed_user_id = (
  SELECT user_id 
  FROM profiles 
  WHERE profiles.display_name = follows.following_author 
  LIMIT 1
)
WHERE followed_user_id IS NULL AND following_author IS NOT NULL;

-- Delete rows that couldn't be mapped (orphaned follows)
DELETE FROM follows WHERE followed_user_id IS NULL;

-- Now make followed_user_id NOT NULL
ALTER TABLE follows ALTER COLUMN followed_user_id SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE follows ADD CONSTRAINT follows_followed_user_id_fkey 
  FOREIGN KEY (followed_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop the old following_author column
ALTER TABLE follows DROP COLUMN IF EXISTS following_author;

-- Add unique constraint to prevent duplicate follows
ALTER TABLE follows ADD CONSTRAINT unique_follow UNIQUE (follower_id, followed_user_id);

-- Update RLS policies to work with the new column
DROP POLICY IF EXISTS "Users can view their own follows" ON follows;
DROP POLICY IF EXISTS "Users can create their own follows" ON follows;
DROP POLICY IF EXISTS "Users can delete their own follows" ON follows;

CREATE POLICY "Users can view their own follows" 
ON follows FOR SELECT 
USING (auth.uid() = follower_id);

CREATE POLICY "Users can create their own follows" 
ON follows FOR INSERT 
WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" 
ON follows FOR DELETE 
USING (auth.uid() = follower_id);