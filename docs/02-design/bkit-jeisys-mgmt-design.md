# Jeisys B2B 프로젝트관리 시스템 Design Document

> Version: 1.0.0 | Created: 2026-02-11 | Status: Draft

## 1. Overview
본 문서는 Jeisys B2B 쇼핑몰 프로젝트 관리를 위한 웹 서비스의 아키텍처, 데이터 모델, API 명세 및 UI 설계를 정의합니다. Supabase를 백엔드로 사용하며, React 기반의 프론트엔드로 구성됩니다.

## 2. Architecture
### System Diagram
- **Frontend**: React (Vite) + TailwindCSS + Shadcn UI + Zustand (State) + React Query (Data Fetching)
- **Backend (BaaS)**: Supabase (Auth, PostgreSQL, Storage, Realtime)
- **Integration**: Supabase Client SDK

### Components
- **AuthGuard**: 세션 유무에 따른 페이지 접근 제어
- **Layout**: 사이드바(프로젝트 목록), 헤더(프로필, 알림), 메인 영역
- **SpecEditor**: Markdown 기반의 기능정의서 편집기
- **RequirementGrid**: 요구사항 리스트 및 다중 선택, 일괄 편집 컴포넌트
- **TraceabilityMap**: 요구사항과 기능 간의 연결 관계 시각화 컴포넌트

## 3. Data Model
### 핵심 테이블 구조 (Supabase)

```typescript
// 1. Functional Specs (기능정의서)
interface FunctionalSpec {
  id: string; // UUID
  project_id: string; // FK
  title: string;
  category: string; // "Large|Medium" 형태의 구분자 기반 또는 개별 필드
  large_category?: string; // 대분류 (예: 공통 기능)
  medium_category?: string; // 중분류 (예: 회원 관리)
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'draft' | 'review' | 'approved';
  version: string;
  content: string; // Markdown content
}

### 계층형 분류 처리 로직
- **Data Side**: `category` 필드에 `대분류|중분류` 형태로 저장하거나, 별도의 컬럼을 사용하여 계층 구조 유지.
- **UI Side**: `lodash.groupBy` 또는 유사한 로직을 사용하여 `대분류 > 중분류 > 소분류(개별 Spec)` 트리 구조로 렌더링.

// 2. Requirements (요구사항정의서)
interface Requirement {
  id: string; // UUID
  project_id: string; // FK
  req_code: string; // e.g., REQ-001
  title: string;
  description: string;
  priority: 'must' | 'should' | 'could' | 'wont';
  status: 'draft' | 'approved' | 'implemented';
}

// 3. Mapping (Traceability)
interface SpecRequirementMapping {
  spec_id: string; // FK to functional_specs
  requirement_id: string; // FK to requirements
}
```

## 4. API Specification
Supabase 클라이언트 SDK를 직접 사용하므로 별도의 REST 엔드포인트 대신 주요 쿼리 함수를 정의합니다.

| Method | Action | Description |
|--------|--------|-------------|
| `fetchSpecs` | SELECT | 프로젝트별 기능정의서 목록 조회 |
| `saveSpec` | UPSERT | 기능정의서 저장 및 버전 업데이트 |
| `fetchMappings` | JOIN | 요구사항-기능 매핑 데이터 조회 (Traceability) |
| `updateMapping` | INSERT/DELETE | 특정 기능에 요구사항 연결 또는 해제 |
| `approveDoc` | UPDATE | 문서 승인 단계 업데이트 및 알림 발송 |

## 5. UI Design
### 주요 화면 구성
1. **Dashboard**: 전체 프로젝트 상태, 최근 수정된 문서, 승인 대기 목록
2. **Project Workspace**:
   - 좌측: 트리 구조의 기능/요구사항 목록
   - 중앙: 문서 편집기 (Markdown View/Edit)
   - 우측: 연관된 요구사항/기능 탭 및 히스토리
3. **Traceability Table**: 요구사항 ID를 행으로, 기능 ID를 열로 하는 매트릭스 뷰 (누락 체크용)

## 6. Test Plan
| Test Case | Expected Result |
|-----------|-----------------|
| 문서 저장 및 버전 기록 | 새 버전 저장 시 `version_history`에 이전 내용 스냅샷 저장 |
| 요구사항 매핑 | 기능정의서에서 특정 요구사항 선택 시 매핑 테이블에 즉시 반영 |
| RLS 권한 테스트 | 프로젝트 멤버가 아닌 사용자가 특정 프로젝트 URL 접근 시 403 차단 |
| 벌크 업로드 | 엑셀/CSV 업로드 시 `b2b_feature_list` 구조대로 자동 파싱 및 저장 |

---
## 💡 bkit 추가 설계 권장사항
1. **Zustand Store 구조**: `useProjectStore`를 통해 현재 선택된 프로젝트, 문서 상태를 전역 관리하여 컴포넌트 간 동기화를 최적화할 것을 권장합니다.
2. **Realtime Collaborative Cursor**: Phase 3 이전에라도 누가 어떤 문서를 보고 있는지 표시하는 간단한 Presence 기능을 추가하면 협업 효율이 극대화됩니다.
3. **Database Trigger**: `functional_specs`의 상태가 `approved`로 변경될 때 자동으로 `requirements`의 상태도 체크하는 트리거를 Supabase DB 레벨에서 구현하는 것이 데이터 무결성에 좋습니다.
