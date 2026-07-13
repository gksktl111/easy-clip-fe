---
name: architecture-guidelines
description: Easy Clip Next.js 프론트엔드의 구조, 의존성, 상태 관리, API 계약, UI, 다국어, 테스트와 설정 규칙을 적용한다. 코드 추가·수정, 리팩터링, 구조 변경, 테스트 작성, 공통 UI 작업 또는 코드 리뷰처럼 src/app, src/features, src/shared, src/i18n, src/messages나 프론트엔드 설정을 다루는 작업에 사용한다.
---

# 프론트엔드 아키텍처 지침

## 작업 순서

1. 변경 대상과 인접 모듈을 먼저 읽고 현재 책임과 데이터 흐름을 파악한다.
2. 라우팅, 기능 도메인, 공통 코드 중 변경이 속할 레이어를 결정한다.
3. 기존 공개 계약과 import 방향을 유지하며 가장 좁은 범위를 수정한다.
4. 로딩, 오류, 빈 상태, 접근성, 반응형과 다국어 영향을 확인한다.
5. 변경 위험에 맞는 정적 검사, 빌드와 실행 검증을 수행한다.

## 프로젝트 구조

- `src/app`: App Router 엔트리와 레이아웃, 페이지 조합만 둔다. 비즈니스 로직과 큰 UI 구현을 feature로 위임한다.
- `src/features/<domain>`: 사용자 기능과 도메인 로직을 둔다. 현재 도메인은 `auth`, `clip`, `folder`, `landing`, `pricing`, `settings`, `subscription`, `trash`다.
- `src/shared`: 여러 feature에서 재사용하는 도메인 비종속 코드만 둔다.
- `src/i18n`, `src/messages`: `next-intl` 요청 설정과 로케일 메시지를 둔다.
- `public`: 공개 정적 자산만 둔다. 비밀 값이나 사설 URL을 넣지 않는다.
- 루트 설정: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`와 npm lockfile을 함께 관리한다.
- 절대 import는 `@/*`를 사용하며 `src/*`를 기준으로 한다.

## 의존성 방향

- 목표 방향을 `app -> features -> shared`로 유지한다.
- `shared`에서 `features`나 `app`을 import하지 않는다.
- feature에서 `app`을 import하지 않는다.
- feature 간 직접 import를 기본적으로 추가하지 않는다. 조합은 `app`에서 처리하고, 진짜 공통 계약은 `shared`로 올린다.
- 도메인 간 캐시 무효화처럼 불가피한 협력은 최소 공개 함수나 타입에만 의존하고 순환 의존을 만들지 않는다.
- 현재 존재하는 역방향·교차 feature import는 마이그레이션 부채이지 새 코드의 선례가 아니다. 요청 범위 밖에서 일괄 이동하지 말고, 관련 변경 시 단계적으로 해소한다.

## Feature 내부 책임

- `api`: HTTP 요청 함수와 transport 수준 처리를 둔다. 공통 요청 처리는 `src/shared/lib/apiClient.ts`를 사용한다.
- `model`: 도메인 타입과 `*.dto.ts` 서버 계약을 둔다. DTO를 UI 상태 타입으로 직접 확장하지 않는다.
- `service`: 프레임워크 의존이 적은 변환, 정책, 브라우저 서비스, 쿼리 키와 캐시 조작을 둔다.
- `hooks`: React와 TanStack Query를 사용하는 조회, mutation, 페이지 상태와 사용자 액션을 둔다. 훅 하나가 조회·UI 상태·모든 액션을 동시에 소유하지 않게 분리한다.
- `ui`: 표현과 사용자 상호작용을 둔다. API 호출 세부 사항과 복잡한 캐시 갱신을 컴포넌트에 넣지 않는다.
- `server`: 서버 전용 초기화나 조회가 필요한 feature에서만 사용한다. 클라이언트 모듈에서 import하지 않는다.
- `const`: 정적 표시 데이터가 큰 feature에서 사용한다. 서버 응답이나 가변 상태를 두지 않는다.

## Shared 내부 책임

- `config`: 환경변수 파싱, 로케일과 앱 전역 상수를 둔다.
- `feedback`: 토스트 같은 전역 피드백을 둔다.
- `hooks`: 도메인 비종속 React 훅을 둔다.
- `layout`: 기능 구현을 소유하지 않는 공통 레이아웃만 둔다.
- `lib`: API client와 순수 공통 유틸을 둔다.
- `providers`: Query, Intl 등 전역 provider를 둔다.
- `server`: 도메인 비종속 서버 전용 함수를 둔다.
- `store`: 여러 화면에서 공유하는 최소 클라이언트 상태만 둔다.
- `ui`: Button, Modal, Input처럼 도메인 비종속 표현 컴포넌트를 역할별 폴더에 둔다.

## 서버와 클라이언트 경계

- 페이지와 레이아웃은 기본적으로 Server Component로 유지한다.
- 브라우저 API, event handler, React state/effect, Zustand, TanStack Query client 또는 클라이언트 `next-intl` 훅이 필요한 경계에만 `"use client"`를 선언한다.
- 클라이언트 경계를 필요 이상으로 상위에 올리지 않는다. 직렬화 가능한 props로 서버 결과를 전달한다.
- 서버 전용 모듈과 비밀 환경변수를 클라이언트 import 그래프에 포함하지 않는다.
- 공개 클라이언트 환경변수만 `NEXT_PUBLIC_` 접두사를 사용하고 `src/shared/config/env.ts`에서 검증한다.

## 상태와 API 계약

- 서버 상태는 TanStack Query로 관리한다. 조회 후 별도 Zustand 복사본을 만들지 않는다.
- mutation에는 영향받는 쿼리 키, 낙관적 업데이트, 롤백, 무효화와 관련 도메인 캐시를 함께 검토한다.
- Query key와 반복되는 캐시 조작은 feature `service/*QueryCache.ts`에 모은다.
- Zustand는 테마, 로케일처럼 클라이언트 전역 UI 설정에 제한한다. 페이지 로컬 상태는 컴포넌트나 훅에 둔다.
- API 함수는 DTO를 입출력 계약으로 사용하고, 화면용 모델 변환이 필요하면 service mapper를 둔다.
- 공통 API 오류는 `ApiError` 계약을 사용하고 사용자 메시지는 UI/feedback 경계에서 결정한다.

## UI와 다국어

- 함수형 TypeScript 컴포넌트와 명시적인 props 타입을 사용한다.
- 반복되는 기본 UI는 `src/shared/ui`를 우선 사용하고 도메인 의미가 있는 UI는 feature에 둔다.
- 공유 UI의 상태와 사용 예시는 같은 폴더의 `*.stories.tsx`로 문서화한다.
- 사용자에게 보이는 신규 문구는 `src/messages`의 지원 로케일에 반영하고 `next-intl`을 통해 읽는다.
- 로딩, 오류, 빈 상태와 mutation 진행 상태를 구분한다. 사용자 액션 중 중복 실행을 막는다.
- 키보드 조작, focus, label, semantic element와 색상 대비를 확인한다.
- Tailwind v4와 `src/app/globals.css` 토큰을 우선 사용하고 임의 inline style과 하드코딩 색상 중복을 피한다.

## 코딩과 테스트

- TypeScript strict 기준을 지키고 `any`보다 구체적인 타입과 type-only import를 사용한다.
- 컴포넌트는 PascalCase, 훅은 `use` 접두사, 유틸리티와 서비스는 camelCase를 사용한다.
- 두 칸 들여쓰기를 사용하고 Prettier와 기존 파일 형식을 따른다.
- 주석은 책임이나 비자명한 제약을 설명할 때만 추가한다.
- 새 단위·컴포넌트 테스트를 도입하면 Vitest + React Testing Library를 사용하고 코드 옆 또는 `__tests__`에 `*.test.tsx`/`*.spec.tsx`로 둔다.
- 브라우저 전체 흐름은 Playwright로 검증하되 현재 스크립트가 없으면 실행했다고 기록하지 않는다.
- 공통 컴포넌트는 렌더링, 상태, 키보드 접근성과 Storybook 빌드를 검토한다.

## 검증 선택

- 모든 코드 변경: `npm run lint`
- 타입·번들·서버/클라이언트 경계 변경: `npm run build`
- 실행 흐름 변경: build 후 `npm run start`로 필요한 경로를 스모크 테스트한다.
- 공통 UI 또는 story 변경: `npm run build-storybook`
- 타입 검사만 빠르게 확인할 필요가 있을 때: `npx tsc --noEmit`
- 현재 존재하지 않는 `npm run package`, `npm run test:e2e`, `npm run typecheck`를 성공한 검증으로 기재하지 않는다.
- 실행하지 못한 검증과 이유를 결과에 명시한다.

## 리뷰 기준

- 레이어 역방향 또는 새 순환 의존
- Server/Client 경계 누수와 비밀 환경변수 노출
- DTO, 도메인 모델과 UI 상태의 혼합
- mutation 후 관련 캐시 최신화 누락
- 로딩·오류·빈 상태 및 접근성 회귀
- 신규 사용자 문구의 로케일 누락
- 실제 동작을 증명하지 못하는 검증 공백
