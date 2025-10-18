-- Add message types and attachments to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'pdf', 'article'));

ALTER TABLE messages
ADD COLUMN IF NOT EXISTS attachment_url text,
ADD COLUMN IF NOT EXISTS article_data jsonb;

-- Create storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-attachments', 
  'message-attachments', 
  false,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for message attachments bucket
CREATE POLICY "Users can upload attachments to their conversations"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'message-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view attachments in their conversations"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'message-attachments' AND
  EXISTS (
    SELECT 1 FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE m.attachment_url LIKE '%' || (storage.foldername(name))[2] || '%'
    AND (c.user_one_id = auth.uid() OR c.user_two_id = auth.uid())
  )
);

CREATE POLICY "Users can delete their own attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'message-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Function to check if user can send media (3 messages rule)
CREATE OR REPLACE FUNCTION public.can_send_media(
  p_conversation_id uuid,
  p_recipient_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_message_count integer;
BEGIN
  -- Count messages from recipient in this conversation
  SELECT COUNT(*) INTO v_message_count
  FROM messages
  WHERE conversation_id = p_conversation_id
    AND sender_id = p_recipient_id;
  
  RETURN v_message_count >= 3;
END;
$$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_sender 
ON messages(conversation_id, sender_id);