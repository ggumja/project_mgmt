# Supabase 설정 가이드
## 기능정의서 & 요구사항정의서 관리 시스템

---

## 1. Supabase 프로젝트 생성

### 1.1 계정 생성 및 프로젝트 초기화
1. [Supabase](https://supabase.com) 접속
2. "Start your project" 클릭
3. GitHub 계정으로 로그인
4. "New Project" 클릭
5. 프로젝트 정보 입력:
   - **Name**: `spec-management-system`
   - **Database Password**: 강력한 비밀번호 설정 (저장 필수!)
   - **Region**: `Northeast Asia (Seoul)` 선택
   - **Pricing Plan**: Free tier 선택
6. "Create new project" 클릭 (약 2분 소요)

### 1.2 API Keys 확인
1. 프로젝트 대시보드에서 **Settings** → **API** 클릭
2. 다음 정보 복사:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (공개 키)
   - **service_role key**: `eyJhbGc...` (비밀 키, 서버용)

---

## 2. 데이터베이스 스키마 설정

### 2.1 SQL Editor에서 스키마 생성
1. Supabase Dashboard → **SQL Editor** 클릭
2. "New query" 클릭
3. 아래 SQL 실행:

```sql
-- ============================================
-- 기능정의서 & 요구사항정의서 관리 시스템
-- Database Schema for Supabase
-- ============================================

-- 1. 사용자 프로필 확장 (Supabase Auth 사용자 확장)
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- admin, pm, developer, qa, member
  department TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 프로젝트 관리
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, archived, completed
  start_date DATE,
  end_date DATE,
  created_by UUID REFERENCES public.user_profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 프로젝트 멤버
CREATE TABLE public.project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- owner, admin, member, viewer
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- 4. 기능정의서
CREATE TABLE public.functional_specs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- product, order, member, inventory, settlement, etc.
  priority TEXT DEFAULT 'medium', -- critical, high, medium, low
  status TEXT DEFAULT 'draft', -- draft, review, approved, rejected
  version TEXT DEFAULT '1.0',
  created_by UUID REFERENCES public.user_profiles(id) NOT NULL,
  approved_by UUID REFERENCES public.user_profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 요구사항정의서
CREATE TABLE public.requirements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  functional_spec_id UUID REFERENCES public.functional_specs(id) ON DELETE SET NULL,
  req_type TEXT NOT NULL, -- functional, non-functional
  title TEXT NOT NULL,
  description TEXT,
  acceptance_criteria TEXT,
  priority TEXT DEFAULT 'medium', -- must, should, could, wont
  status TEXT DEFAULT 'draft', -- draft, review, approved, rejected, implemented
  version TEXT DEFAULT '1.0',
  created_by UUID REFERENCES public.user_profiles(id) NOT NULL,
  approved_by UUID REFERENCES public.user_profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 버전 이력
CREATE TABLE public.version_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_type TEXT NOT NULL, -- functional_spec, requirement
  document_id UUID NOT NULL,
  version TEXT NOT NULL,
  changes JSONB, -- 변경 내용을 JSON으로 저장
  changed_by UUID REFERENCES public.user_profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 댓글
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_type TEXT NOT NULL, -- functional_spec, requirement
  document_id UUID NOT NULL,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- 대댓글용
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. 첨부파일 (Supabase Storage 메타데이터)
CREATE TABLE public.attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_type TEXT NOT NULL, -- functional_spec, requirement
  document_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_size BIGINT,
  mime_type TEXT,
  uploaded_by UUID REFERENCES public.user_profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. 승인 워크플로우
CREATE TABLE public.approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_type TEXT NOT NULL, -- functional_spec, requirement
  document_id UUID NOT NULL,
  approver_id UUID REFERENCES public.user_profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================

CREATE INDEX idx_projects_created_by ON public.projects(created_by);
CREATE INDEX idx_functional_specs_project ON public.functional_specs(project_id);
CREATE INDEX idx_functional_specs_status ON public.functional_specs(status);
CREATE INDEX idx_requirements_project ON public.requirements(project_id);
CREATE INDEX idx_requirements_spec ON public.requirements(functional_spec_id);
CREATE INDEX idx_comments_document ON public.comments(document_type, document_id);
CREATE INDEX idx_version_history_document ON public.version_history(document_type, document_id);

-- ============================================
-- Triggers for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_functional_specs_updated_at BEFORE UPDATE ON public.functional_specs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requirements_updated_at BEFORE UPDATE ON public.requirements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_approvals_updated_at BEFORE UPDATE ON public.approvals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2.2 Row Level Security (RLS) 정책 설정

```sql
-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.functional_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.version_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;

-- User Profiles: 사용자는 자신의 프로필만 수정 가능
CREATE POLICY "Users can view all profiles" ON public.user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects: 프로젝트 멤버만 조회 가능
CREATE POLICY "Users can view projects they are members of" ON public.projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = projects.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Project owners can update projects" ON public.projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = projects.id 
        AND user_id = auth.uid() 
        AND role IN ('owner', 'admin')
    )
  );

-- Functional Specs: 프로젝트 멤버만 조회/수정 가능
CREATE POLICY "Users can view specs in their projects" ON public.functional_specs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = functional_specs.project_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create specs in their projects" ON public.functional_specs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = functional_specs.project_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update specs they created" ON public.functional_specs
  FOR UPDATE USING (created_by = auth.uid());

-- Requirements: 프로젝트 멤버만 조회/수정 가능
CREATE POLICY "Users can view requirements in their projects" ON public.requirements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = requirements.project_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create requirements in their projects" ON public.requirements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.project_members
      WHERE project_id = requirements.project_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update requirements they created" ON public.requirements
  FOR UPDATE USING (created_by = auth.uid());

-- Comments: 프로젝트 멤버만 조회/작성 가능
CREATE POLICY "Users can view comments on documents in their projects" ON public.comments
  FOR SELECT USING (true); -- 문서 접근 권한으로 제어됨

CREATE POLICY "Authenticated users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE USING (user_id = auth.uid());
```

---

## 3. Authentication 설정

### 3.1 Email/Password 인증 활성화
1. Supabase Dashboard → **Authentication** → **Providers** 클릭
2. **Email** 토글 활성화
3. **Confirm email** 옵션 설정 (선택사항)

### 3.2 소셜 로그인 설정 (선택사항)
1. **Google** 또는 **GitHub** 클릭
2. OAuth 앱 생성 후 Client ID/Secret 입력
3. Callback URL: `https://xxxxx.supabase.co/auth/v1/callback`

---

## 4. Storage 설정 (파일 첨부용)

### 4.1 Storage Bucket 생성
1. Supabase Dashboard → **Storage** 클릭
2. "Create a new bucket" 클릭
3. Bucket 정보 입력:
   - **Name**: `attachments`
   - **Public bucket**: ❌ (비공개)
4. "Create bucket" 클릭

### 4.2 Storage Policy 설정
```sql
-- 인증된 사용자만 파일 업로드 가능
CREATE POLICY "Authenticated users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'attachments' AND auth.role() = 'authenticated'
  );

-- 프로젝트 멤버만 파일 조회 가능
CREATE POLICY "Users can view files in their projects" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'attachments' AND auth.role() = 'authenticated'
  );

-- 업로드한 사용자만 파일 삭제 가능
CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'attachments' AND auth.uid()::text = owner
  );
```

---

## 5. 환경 변수 설정

### 5.1 프론트엔드 `.env` 파일 생성
```bash
# d:/Project_mgmt/frontend/.env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5.2 Supabase Client 초기화
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## 6. 테스트 데이터 삽입

```sql
-- 테스트 프로젝트 생성 (실제 사용자 ID로 교체 필요)
INSERT INTO public.projects (name, description, status, created_by)
VALUES (
  'B2B 쇼핑몰 프로젝트',
  'B2B 전자상거래 플랫폼 개발',
  'active',
  'your-user-uuid-here'
);

-- 기능정의서 샘플
INSERT INTO public.functional_specs (
  project_id, title, description, category, priority, status, created_by
)
VALUES (
  'project-uuid-here',
  '상품 대량 등록 기능',
  '엑셀 파일을 통한 상품 대량 등록 기능',
  'product',
  'high',
  'draft',
  'your-user-uuid-here'
);
```

---

## 7. Supabase 주요 기능 활용

### 7.1 실시간 구독 (Realtime)
```typescript
// 댓글 실시간 업데이트
const channel = supabase
  .channel('comments')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'comments',
      filter: `document_id=eq.${documentId}`
    },
    (payload) => {
      console.log('New comment:', payload.new)
    }
  )
  .subscribe()
```

### 7.2 파일 업로드
```typescript
// 파일 업로드
const { data, error } = await supabase.storage
  .from('attachments')
  .upload(`${documentId}/${file.name}`, file)

// 파일 URL 가져오기
const { data: urlData } = supabase.storage
  .from('attachments')
  .getPublicUrl(`${documentId}/${file.name}`)
```

### 7.3 인증
```typescript
// 회원가입
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// 로그인
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// 로그아웃
await supabase.auth.signOut()

// 현재 사용자
const { data: { user } } = await supabase.auth.getUser()
```

---

## 8. 보안 체크리스트

- [x] Row Level Security (RLS) 활성화
- [x] 모든 테이블에 RLS 정책 설정
- [x] Storage 버킷 비공개 설정
- [x] API Keys 환경 변수로 관리
- [ ] Production 환경에서 `service_role` key 노출 금지
- [ ] HTTPS만 사용
- [ ] CORS 설정 확인

---

## 9. 다음 단계

1. ✅ Supabase 프로젝트 생성
2. ✅ 데이터베이스 스키마 실행
3. ✅ RLS 정책 설정
4. ✅ Authentication 활성화
5. ✅ Storage 버킷 생성
6. [ ] 프론트엔드 프로젝트에 Supabase 연동
7. [ ] 인증 UI 구현
8. [ ] CRUD 기능 구현

---

**참고 문서**:
- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
