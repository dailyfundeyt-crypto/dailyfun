-- Create author profiles that work with search functionality
-- We'll create these as public profiles that don't require auth users

-- First, let's modify the profiles table to make user_id nullable for author profiles
ALTER TABLE public.profiles ALTER COLUMN user_id DROP NOT NULL;

-- Add a new column to distinguish between regular user profiles and author profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_type text DEFAULT 'user';

-- Insert author profiles without requiring auth users
INSERT INTO public.profiles (
  display_name,
  bio,
  profession,
  avatar_url,
  is_public,
  profile_type,
  created_at,
  updated_at
) VALUES 
(
  'Stefan Kunc',
  'Gründer und Visionär von Daily Fun. Experte für Unternehmensführung, Innovation und digitale Transformation.',
  'Gründer & CEO',
  '/lovable-uploads/dd996217-e9c4-456c-af16-469f05791ad2.png',
  true,
  'author',
  now(),
  now()
),
(
  'Dr. Elke Schneider',
  'Leiterin für Humor & Kreativität. Spezialistin für Wissenschaft, Psychologie und unterhaltsame Bildung.',
  'Head of Humor & Creativity',
  '/lovable-uploads/2679b50f-c4f9-40d5-bbce-828296880ba2.png',
  true,
  'author',
  now(),
  now()
),
(
  'Karl Bergmann',
  'Lead Story Weaver. Experte für Gesellschaft, Politik und komplexe Themenaufbereitung.',
  'Lead Story Weaver',
  '/lovable-uploads/afb210bd-6729-403e-857a-9271499984f4.png',
  true,
  'author',
  now(),
  now()
),
(
  'Jonas Richter',
  'Content-Alchemist. Spezialist für Technologie, Gaming und visuelle Medien.',
  'Content Alchemist',
  '/lovable-uploads/3e2b5f3d-bb10-4914-847d-e40fa0928943.png',
  true,
  'author',
  now(),
  now()
);