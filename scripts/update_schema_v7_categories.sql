-- Ensure Functional Specs have Category Hierarchy Columns
ALTER TABLE public.functional_specs
ADD COLUMN IF NOT EXISTS large_category TEXT,
ADD COLUMN IF NOT EXISTS medium_category TEXT,
ADD COLUMN IF NOT EXISTS small_category TEXT,
ADD COLUMN IF NOT EXISTS spec_code TEXT;

-- Index for faster filtering
CREATE INDEX IF NOT EXISTS idx_functional_specs_categories 
ON public.functional_specs(large_category, medium_category);
