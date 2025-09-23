-- Clean up duplicate author profiles and create proper ones that match article authors
-- First, delete the existing author profiles to avoid duplicates
DELETE FROM public.profiles WHERE profile_type = 'author';

-- Insert author profiles with exact names matching the articles data
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
-- Stefan Kunc (exact match for articles)
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
-- Dr. Elke Schneider (exact match for articles)
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
-- Karl Bergmann - NOTE: Articles use "Karl Bergmann", not "Herr Karl Bergmann"
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
-- Herr Karl Bergmann (for employees data compatibility)
(
  'Herr Karl Bergmann',
  'Lead Story Weaver. Experte für Gesellschaft, Politik und komplexe Themenaufbereitung.',
  'Lead Story Weaver',
  '/lovable-uploads/afb210bd-6729-403e-857a-9271499984f4.png',
  true,
  'author',
  now(),
  now()
),
-- Jonas Richter - NOTE: Articles use "Jonas Richter", not "Herr Jonas Richter"
(
  'Jonas Richter',
  'Content-Alchemist. Spezialist für Technologie, Gaming und visuelle Medien.',
  'Content Alchemist',
  '/lovable-uploads/3e2b5f3d-bb10-4914-847d-e40fa0928943.png',
  true,
  'author',
  now(),
  now()
),
-- Herr Jonas Richter (for employees data compatibility)
(
  'Herr Jonas Richter',
  'Content-Alchemist. Spezialist für Technologie, Gaming und visuelle Medien.',
  'Content Alchemist',
  '/lovable-uploads/3e2b5f3d-bb10-4914-847d-e40fa0928943.png',
  true,
  'author',
  now(),
  now()
);