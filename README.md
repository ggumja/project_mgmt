# 기능정의서 & 요구사항정의서 관리 시스템
## B2B 쇼핑몰 프로젝트용 웹 프로그램

---

## 📌 프로젝트 소개

B2B 쇼핑몰 개발 프로젝트를 위한 **기능정의서**와 **요구사항정의서**를 체계적으로 관리할 수 있는 웹 기반 관리 시스템입니다.

### 주요 기능
- ✅ 기능정의서 & 요구사항정의서 CRUD
- ✅ 버전 관리 및 변경 이력 추적
- ✅ 승인 워크플로우
- ✅ 문서 간 연관관계 관리
- ✅ 검색 및 필터링
- ✅ 협업 기능 (댓글, 멘션)
- ✅ B2B 쇼핑몰 특화 템플릿

---

## 🚀 빠른 시작

### 사전 요구사항
- Node.js 18+
- Supabase 계정 (무료)
- npm 또는 yarn

### 설치 및 실행

#### 1. Supabase 프로젝트 설정
상세한 설정 가이드는 [Supabase Setup Guide](./docs/supabase_setup.md)를 참고하세요.

```bash
# 1. https://supabase.com 에서 프로젝트 생성
# 2. SQL Editor에서 데이터베이스 스키마 실행
# 3. API Keys 복사 (Project URL, anon key)
```

#### 2. 프론트엔드 설정
```bash
npm create vite@latest spec-management-app -- --template react-ts
cd spec-management-app
npm install

# Tailwind CSS 초기화
npx tailwindcss init -p

# Shadcn UI 초기화
npx shadcn@latest init

# 필수 패키지 설치
npm install @supabase/supabase-js
npm install react-router-dom @tanstack/react-query zustand
npm install react-hook-form zod @hookform/resolvers
npm install date-fns

# Shadcn UI 컴포넌트 설치
npx shadcn@latest add button input form table dialog card

npm run dev
```

#### 3. 환경 변수 설정
```bash
# .env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📁 프로젝트 구조

상세한 구조는 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)를 참고하세요.

```
spec-management-system/
├── frontend/          # React + TypeScript
├── backend/           # Node.js + Express
├── templates/         # 문서 템플릿
└── docs/             # 프로젝트 문서
```

---

## 📚 문서

- **[PDCA Plan](./docs/pdca_plan.md)**: 전체 개발 계획 및 PDCA 사이클
- **[B2B Feature List](./docs/b2b_feature_list.md)**: B2B 쇼핑몰 기능 리스트 (기본 + B2B 특화)
- **[Supabase Setup Guide](./docs/supabase_setup.md)**: Supabase 설정 가이드 (필수)
- **[Shadcn UI Guide](./docs/shadcn_ui_guide.md)**: Shadcn UI 사용 가이드
- **[기능정의서 템플릿](./templates/functional_spec_template.md)**: 기능정의서 작성 템플릿
- **[요구사항정의서 템플릿](./templates/requirements_template.md)**: 요구사항정의서 작성 템플릿
- **[프로젝트 구조](./PROJECT_STRUCTURE.md)**: 디렉토리 구조 설명

---

## 🛠️ 기술 스택

### Frontend
- React 18 + TypeScript
- Vite
- **Shadcn UI** - Beautiful, accessible UI components
- TailwindCSS
- React Query
- Zustand
- React Hook Form

### Backend (Supabase)
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication (Email/Password, OAuth)
  - Row Level Security (RLS)
  - Realtime Subscriptions
  - Storage (파일 첨부)
- Supabase Client Library

---

## 📋 개발 로드맵

### Phase 1: MVP (8주)
- [x] PDCA 계획 수립
- [ ] 프로젝트 초기 설정
- [ ] 데이터베이스 스키마 구현
- [ ] 인증 시스템
- [ ] 기능정의서 CRUD
- [ ] 요구사항정의서 CRUD
- [ ] 버전 관리
- [ ] 승인 워크플로우

### Phase 2: 고급 기능 (3개월)
- [ ] AI 기반 요구사항 추천
- [ ] 자동 문서 생성
- [ ] 외부 시스템 연동 (Jira, Confluence)
- [ ] 고급 분석 및 리포팅

### Phase 3: 확장 (6개월)
- [ ] 모바일 앱
- [ ] 실시간 협업 (WebSocket)
- [ ] 다국어 지원
- [ ] 고급 권한 관리

---

## 🤝 기여 방법

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

---

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.

---

## 🎯 다음 단계

1. **즉시 시작**: [PDCA Plan](./docs/pdca_plan.md) 검토
2. **템플릿 확인**: [기능정의서](./templates/functional_spec_template.md) 및 [요구사항정의서](./templates/requirements_template.md) 템플릿 확인
3. **개발 시작**: 프론트엔드 및 백엔드 프로젝트 초기화

---

**Last Updated**: 2026-02-11
