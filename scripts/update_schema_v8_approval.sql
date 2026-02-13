-- ============================================
-- Requirement Approval Workflow Schema Update
-- Created: 2026-02-13
-- ============================================

-- 1. Add columns for review workflow
ALTER TABLE public.requirements
ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES public.user_profiles(id),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 2. Update comments
COMMENT ON COLUMN public.requirements.reviewer_id IS '승인/반려 처리자 ID';
COMMENT ON COLUMN public.requirements.reviewed_at IS '승인/반려 처리 일시';
COMMENT ON COLUMN public.requirements.rejection_reason IS '반려 사유';

-- 3. Policy update (Note: Assuming existing RLS allows update, but we might need specific policies for status changes in the future)
-- For now, relying on application logic + existing row level security.
