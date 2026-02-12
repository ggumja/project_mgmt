-- ============================================
-- 1. 기초 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.functional_specs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'draft',
  version TEXT DEFAULT '1.0',
  content TEXT,
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.requirements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  functional_spec_id UUID REFERENCES public.functional_specs(id) ON DELETE SET NULL,
  req_code TEXT UNIQUE NOT NULL,
  req_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'draft',
  version TEXT DEFAULT '1.0',
  created_by UUID REFERENCES public.user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. 테스트 관리자 계정 및 프로젝트 생성
-- (UUID는 임의 생성이며, 나중에 본인 계정으로 변경 가능)
-- ============================================

DO $$
DECLARE
    admin_id UUID := '00000000-0000-0000-0000-000000000001';
    project_id UUID;
BEGIN
    -- 관리자 프로필 생성
    INSERT INTO public.user_profiles (id, email, name, role)
    VALUES (admin_id, 'admin@example.com', 'Admin', 'admin')
    ON CONFLICT (id) DO NOTHING;

    -- 기본 프로젝트 생성
    INSERT INTO public.projects (id, name, description, status, created_by)
    VALUES ('00000000-0000-0000-0000-000000000002', 'Jeisys B2B Shopping Mall', 'Jeisys B2B Shopping Mall Project', 'active', admin_id)
    ON CONFLICT (id) DO NOTHING
    RETURNING id INTO project_id;
END $$;
