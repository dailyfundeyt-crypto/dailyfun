-- Ensure message-attachments bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('message-attachments', 'message-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Force bucket to be public in case it already existed as private
UPDATE storage.buckets
SET public = true
WHERE id = 'message-attachments';