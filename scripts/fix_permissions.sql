-- ============================================
-- FIX: Requirements Table Permissions & Schema
-- ============================================

-- 1. 승인 관련 컬럼이 확실히 존재하는지 확인
ALTER TABLE public.requirements
ADD COLUMN IF NOT EXISTS reviewer_id UUID,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 2. 외래 키 제약조건이 있다면 삭제 (개발 단계에서 FK 에러 방지)
-- 만약 reviewer_id가 user_profiles에 없는 경우 저장이 실패하는 것을 방지합니다.
ALTER TABLE public.requirements 
DROP CONSTRAINT IF EXISTS requirements_reviewer_id_fkey;

-- 3. 권한(RLS) 정책 초기화
-- 모든 사용자가 자유롭게 읽기/쓰기/수정/삭제 가능하도록 설정 (개발 편의성)
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "requirements_policy_all" ON public.requirements;

CREATE POLICY "requirements_policy_all"
ON public.requirements
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- 4. public.user_profiles 테이블 접근 권한도 확인
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_policy_all" ON public.user_profiles;

CREATE POLICY "profiles_policy_all"
ON public.user_profiles
FOR ALL
TO public
USING (true)
WITH CHECK (true);
