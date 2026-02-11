# 프로젝트 구조

```
spec-management-system/
├── src/                          # React + TypeScript 프론트엔드
│   ├── components/              # 재사용 가능한 컴포넌트
│   │   ├── common/             # 공통 컴포넌트
│   │   ├── layout/             # 레이아웃 컴포넌트
│   │   ├── forms/              # 폼 컴포넌트
│   │   └── tables/             # 테이블 컴포넌트
│   ├── pages/                  # 페이지 컴포넌트
│   │   ├── auth/               # 인증 관련
│   │   ├── dashboard/          # 대시보드
│   │   ├── projects/           # 프로젝트 관리
│   │   ├── specs/              # 기능정의서
│   │   └── requirements/       # 요구사항정의서
│   ├── hooks/                  # 커스텀 훅
│   ├── lib/                    # 라이브러리 설정
│   │   └── supabase.ts        # Supabase 클라이언트
│   ├── services/               # API 서비스 (Supabase 쿼리)
│   ├── store/                  # 상태 관리 (Zustand)
│   ├── types/                  # TypeScript 타입
│   │   └── database.types.ts  # Supabase 생성 타입
│   ├── utils/                  # 유틸리티 함수
│   └── App.tsx
│
├── public/                      # 정적 파일
│
├── templates/                   # 문서 템플릿
│   ├── functional_spec_template.md
│   └── requirements_template.md
│
├── docs/                        # 프로젝트 문서
│   ├── pdca_plan.md
│   ├── supabase_setup.md       # Supabase 설정 가이드
│   └── user_manual.md
│
├── .env                         # 환경 변수 (Supabase Keys)
├── package.json
├── vite.config.ts
└── README.md
```

## 주요 디렉토리 설명

### Frontend
- **components/**: 재사용 가능한 UI 컴포넌트
- **pages/**: 라우팅되는 페이지 컴포넌트
- **hooks/**: 커스텀 React 훅 (useAuth, useFetch 등)
- **services/**: API 통신 로직
- **store/**: 전역 상태 관리
- **types/**: TypeScript 인터페이스 및 타입 정의

### Backend
- **controllers/**: HTTP 요청 처리
- **services/**: 비즈니스 로직 구현
- **models/**: 데이터베이스 모델 (Prisma)
- **routes/**: API 엔드포인트 정의
- **middleware/**: 인증, 로깅, 에러 처리 등

### Templates
- 기능정의서 및 요구사항정의서 템플릿
- 사용자가 문서 작성 시 참고

### Docs
- 프로젝트 문서화
- API 문서, 사용자 매뉴얼 등
