-- Add encrypted_private_key column to encryption_keys table
ALTER TABLE public.encryption_keys
ADD COLUMN encrypted_private_key text;

-- Add salt column for PBKDF2 key derivation
ALTER TABLE public.encryption_keys
ADD COLUMN key_derivation_salt text;