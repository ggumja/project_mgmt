-- 🚨 DROP TABLE to reset schema and remove potential old constraints (FK issues)
DROP TABLE IF EXISTS public.spec_histories;

-- Create table for modification history
CREATE TABLE public.spec_histories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  spec_id UUID REFERENCES public.functional_specs(id) ON DELETE CASCADE,
  previous_version TEXT,
  new_version TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  changed_by UUID, -- Storing User ID (No FK constraint for flexibility)
  change_summary TEXT
);

-- Index for faster history lookup by spec
CREATE INDEX IF NOT EXISTS idx_spec_histories_spec_id ON public.spec_histories(spec_id);

-- 🚨 IMPORTANT: Enable RLS and add policy to allow inserts/selects
ALTER TABLE public.spec_histories ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for development
CREATE POLICY "Allow all for spec_histories" ON public.spec_histories
FOR ALL USING (true) WITH CHECK (true);
