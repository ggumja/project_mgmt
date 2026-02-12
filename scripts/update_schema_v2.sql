-- Add discrete columns for better filtering and stability
ALTER TABLE public.functional_specs
ADD COLUMN IF NOT EXISTS spec_code TEXT,
ADD COLUMN IF NOT EXISTS large_category TEXT,
ADD COLUMN IF NOT EXISTS medium_category TEXT,
ADD COLUMN IF NOT EXISTS small_category TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS dev_scope TEXT DEFAULT '1차',
ADD COLUMN IF NOT EXISTS importance TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Optional: Backfill data from category string if needed
-- (This requires complex string splitting in SQL which might be better done in a script if data volume is low)
