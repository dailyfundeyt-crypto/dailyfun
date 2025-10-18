-- Create encryption_keys table to store public keys
CREATE TABLE IF NOT EXISTS encryption_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  public_key text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE encryption_keys ENABLE ROW LEVEL SECURITY;

-- Anyone can read public keys (needed for encryption)
CREATE POLICY "Anyone can view public keys"
ON encryption_keys
FOR SELECT
USING (true);

-- Users can insert their own public key
CREATE POLICY "Users can insert their own public key"
ON encryption_keys
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own public key
CREATE POLICY "Users can update their own public key"
ON encryption_keys
FOR UPDATE
USING (auth.uid() = user_id);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_encryption_keys_user_id ON encryption_keys(user_id);

-- Add delivery status to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS delivered_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS is_encrypted boolean DEFAULT true;

-- Create index for undelivered messages
CREATE INDEX IF NOT EXISTS idx_messages_undelivered 
ON messages(conversation_id, created_at) 
WHERE delivered_at IS NULL;