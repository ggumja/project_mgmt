-- 1. Add discrete columns for better filtering (if not exists)
ALTER TABLE public.functional_specs
ADD COLUMN IF NOT EXISTS spec_code TEXT,
ADD COLUMN IF NOT EXISTS large_category TEXT,
ADD COLUMN IF NOT EXISTS medium_category TEXT,
ADD COLUMN IF NOT EXISTS small_category TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS dev_scope TEXT DEFAULT '1차',
ADD COLUMN IF NOT EXISTS importance TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Add sort_order column for manual ordering
ALTER TABLE public.functional_specs
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 3. Create an index for performance
CREATE INDEX IF NOT EXISTS idx_functional_specs_sort_order ON public.functional_specs(sort_order);
