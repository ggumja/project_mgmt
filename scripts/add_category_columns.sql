-- Add hierarchical category columns to functional_specs
ALTER TABLE public.functional_specs 
ADD COLUMN IF NOT EXISTS large_category TEXT,
ADD COLUMN IF NOT EXISTS medium_category TEXT;

-- Refresh PostgREST cache (done automatically by Supabase but good to note)
