-- Add sort_order column for manual ordering
ALTER TABLE public.functional_specs
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Create an index for performance
CREATE INDEX IF NOT EXISTS idx_functional_specs_sort_order ON public.functional_specs(sort_order);
