# App Router 라우팅·보호 경계 아키텍처

> 기준일: 2026-09-01
>
> 적용 범위: Easy Clip 프런트엔드의 App Router route group, 워크스페이스 레이아웃, 보호 경로 진입 정책
>
> 관련 문서: [인증 아키텍처](./auth-architecture.md)

## 1. 아키텍처 개요

현재 App Router는 공개 화면과 인증 필요 화면을 route group으로 분리한다. URL은 유지하되, 경로의 접근 정책과 워크스페이스 레이아웃의 적용 범위를 파일 구조로 드러내는 방식이다.

```text
src/app/
├── (public)/                         # 로그인 없이 접근 가능한 화면
│   ├── page.tsx                      # /
│   ├── login/page.tsx                # /login
│   └── pricing/page.tsx              # /pricing
├── (protected)/                      # 인증이 필요한 모든 화면의 공통 경계
│   ├── layout.tsx                    # AuthGuard 적용
│   ├── (workspace)/                  # 사이드바를 공유하는 클립 워크스페이스
│   │   ├── layout.tsx                # WorkspaceShell 적용
│   │   ├── _components/              # 이 route group 전용 셸·사이드바
│   │   ├── _routes/                  # 이 route group 전용 feature 조합
│   │   ├── folder/[id]/page.tsx      # /folder/[id]
│   │   ├── favorites/page.tsx        # /favorites
│   │   ├── recent/page.tsx           # /recent
│   │   └── trash/page.tsx            # /trash
│   └── billing/                      # /billing 및 결제 결과 경로
└── layout.tsx                        # 전역 Provider와 초기 cookie 힌트 조합
```

`(public)`, `(protected)`, `(workspace)`는 URL segment를 만들지 않는다. URL 정책은 다음과 같이 유지한다.

| 화면                 | 대표 URL                                        | 적용 경계             |
| -------------------- | ----------------------------------------------- | --------------------- |
| 랜딩·로그인·요금제   | `/`, `/login`, `/pricing`                       | public                |
| 폴더 클립            | `/folder/[id]`                                  | protected + workspace |
| 즐겨찾기·최근·휴지통 | `/favorites`, `/recent`, `/trash`               | protected + workspace |
| 결제·결제 결과       | `/billing`, `/billing/success`, `/billing/fail` | protected             |

기존 `/{id}`, `/{id}/favorites`, `/{id}/recent`은 현재 URL 정책에 포함하지 않는다. 기존 북마크 redirect가 필요해지면 별도 이슈에서 명시적으로 다룬다.

## 2. 워크스페이스 셸의 소유권

`WorkspaceShell`, `WorkspaceSidebar`, `_routes`는 의도적으로 `src/app/(protected)/(workspace)` 아래에 둔다. 이들은 개별 도메인 기능이 아니라 **workspace route group의 children 슬롯, 탐색, 모바일 사이드바, 설정 진입점**을 조합하는 경로 전용 컴포넌트다.

```text
(workspace)/layout.tsx
  → WorkspaceShell
      → WorkspaceSidebar
          → folder / clip / trash feature의 공개 API 소비
      → route children
      → SettingsModal 진입점
```

각 feature는 자신의 도메인 UI·조회·mutation을 소유한다. 반면 워크스페이스 셸은 여러 feature를 함께 배치하고 route 이동 및 레이아웃 상태를 연결할 뿐, 폴더·클립·휴지통의 비즈니스 규칙을 새로 소유하지 않는다.

### 유지 기준

- workspace 안에서만 사용하는 레이아웃 조합은 `_components`, `_routes`에 둔다.
- 다른 route group에서도 재사용되는 일반 레이아웃은 `src/shared/layout`으로 올린다.
- 하나의 도메인 기능으로 독립해 API·상태·UI를 소유하게 되면 해당 `src/features/<domain>`으로 이동한다.
- 파일 위치만을 이유로 workspace 전용 조합을 feature 또는 shared로 옮기지 않는다. 재사용 범위와 책임 변화가 이동의 근거다.

이 선택은 `src/app`을 도메인 비즈니스 로직 저장소로 사용한다는 뜻이 아니다. 해당 경로에 묶인 조합 책임만 두고, HTTP 요청·DTO·도메인 모델·재사용 가능한 UI는 기존 feature/shared 계층에 유지한다.

## 3. 보호 경로의 2단계 경계

보호 경로는 하나의 컴포넌트가 모든 인증을 처리하지 않는다. 요청을 빠르게 분기하는 1차 경계와, 실제 세션 검증 결과를 화면에 적용하는 2차 경계를 분리한다.

```mermaid
flowchart LR
  Request[브라우저의 경로 요청] --> Proxy[src/proxy.ts]
  Proxy -->|인증 cookie 없음 + 보호 경로| Login[/login redirect]
  Proxy -->|cookie 존재 또는 공개 경로| Root[RootLayout]
  Root --> Hint[hasAuthSessionCookie: 초기화 힌트]
  Hint --> Provider[AuthProvider]
  Provider --> Query[GET /users/me]
  Query --> API[apiClient]
  API --> Backend[백엔드 JWT·세션 검증]
  Backend --> Status[AuthStatus]
  Status --> Guard[AuthGuard]
  Guard -->|authenticated| Content[보호 화면 children]
  Guard -->|unauthenticated| Login
```

| 경계                                    | 책임                                                                                                                                                                | 하지 않는 일                                                              |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `proxy.ts`                              | 요청의 cookie 이름 존재 여부를 빠르게 확인하고, cookie가 전혀 없는 보호 경로 요청을 `/login`으로 redirect한다. 인증 cookie가 있는 `/` 요청은 `/favorites`로 보낸다. | JWT 서명·만료·사용자 존재 여부를 검증하거나 백엔드 API를 호출하지 않는다. |
| `RootLayout` + `hasAuthSessionCookie()` | `AuthProvider`가 초기 `/users/me` 조회를 시작할지 결정할 cookie 힌트를 전달한다.                                                                                    | 유효한 세션이라고 확정하지 않는다.                                        |
| `AuthProvider`                          | React Query로 현재 사용자 조회를 시작하고 결과를 `AuthStatus`와 `AuthContext`로 해석한다.                                                                           | router를 사용하거나 JWT를 직접 검증하지 않는다.                           |
| 백엔드 `GET /users/me`                  | access token과 세션·사용자 상태를 실제로 검증하고 프로필 또는 인증 오류를 반환한다.                                                                                 | 프런트엔드 화면 전환을 결정하지 않는다.                                   |
| `AuthGuard`                             | 실제 검증 결과에서 만들어진 `AuthStatus`에 따라 children, 로딩·오류 UI, `/login` fallback redirect를 결정한다.                                                      | JWT를 직접 파싱·서명 검증하거나 cookie를 조작하지 않는다.                 |

따라서 “AuthGuard가 실제 토큰 검증을 담당한다”는 표현은 **실제 검증 결과를 보호 화면에 적용하는 2차 경계**라는 의미로 사용한다. 토큰의 암호학적 검증과 세션 인가는 백엔드가 `/users/me` 처리 과정에서 수행한다.

## 4. 초기 진입과 redirect 흐름

### cookie가 없는 보호 경로 요청

1. `proxy.ts`가 보호 경로와 인증 cookie 부재를 확인한다.
2. React hydration이나 `/users/me` 요청 전에 `/login`으로 redirect한다.
3. 이 빠른 분기는 불필요한 보호 화면 로딩을 줄이기 위한 UX 경계다.

### cookie가 있는 보호 경로 요청

1. `proxy.ts`는 요청을 통과시킨다. cookie의 존재는 유효성을 보장하지 않는다.
2. `RootLayout`이 같은 cookie 존재 여부를 `shouldRestoreSession` 초기값으로 전달한다.
3. `AuthProvider`가 `/users/me`을 요청하고, `apiClient`는 필요할 때 refresh·재시도 정책을 수행한다.
4. 백엔드 검증이 성공하면 `AuthGuard`가 children을 렌더링한다.
5. 만료·무효 cookie로 401 또는 404가 확정되면 client session을 정리하고 `AuthGuard`가 `/login`으로 이동한다.

### 일시적 API 오류

네트워크·서버 오류처럼 인증 실패로 단정할 수 없는 오류는 `error` 상태로 남긴다. `AuthGuard`는 즉시 로그인으로 보내지 않고 세션 확인 재시도 UI를 제공한다.

## 5. 현재 선택과 의도적인 비범위

현재 보호 레이아웃은 서버에서 `/users/me`을 직접 호출해 redirect하지 않고, `AuthGuard`를 통해 클라이언트에서 검증 결과를 적용한다. 이는 다음 현재 계약을 유지하기 위한 선택이다.

- refresh·재시도와 만료 이벤트 처리는 브라우저 `apiClient`와 `AuthProvider`가 일관되게 담당한다.
- `proxy.ts`는 빠른 경로 분기만 담당하므로 backend 세션 계약이나 Edge 실행 환경에 강하게 결합되지 않는다.
- 실제 JWT·리소스 인가는 항상 백엔드에서 강제한다. 프런트엔드 redirect는 접근 UX를 위한 보조 경계다.

보호 layout의 서버 우선 세션 검증, 서버 데이터 prefetch와 React Query hydration, route-level `loading.tsx`·`error.tsx`·`not-found.tsx`는 현재 구조의 누락으로 간주하지 않는다. 도입이 필요해질 경우에는 backend cookie forwarding·refresh 응답 전달·초기 cache 정책·실제 UX 측정을 함께 검토하는 별도 작업으로 다룬다.

## 6. 변경 시 확인할 불변 조건

- cookie가 없는 사용자는 보호 경로의 클라이언트 UI를 보기 전에 `/login`으로 이동한다.
- cookie만 존재하는 사용자는 `/users/me`의 백엔드 검증 결과가 성공하기 전까지 보호 children을 보지 않는다.
- 만료·무효 세션은 client query cache를 정리하고 보호 경로에서 `/login` fallback을 탄다.
- 네트워크 오류는 세션 종료로 오인하지 않고 재시도할 수 있다.
- workspace 전용 셸은 개별 feature의 내부 구현이 아닌 공개 API만 소비한다.

## 7. 관련 코드와 문서

| 항목                             | 위치                                                                       |
| -------------------------------- | -------------------------------------------------------------------------- |
| 1차 경로 분기                    | `src/proxy.ts`                                                             |
| 전역 cookie 힌트와 Provider 조합 | `src/app/layout.tsx`                                                       |
| 보호 경로 공통 경계              | `src/app/(protected)/layout.tsx`                                           |
| workspace route 전용 셸          | `src/app/(protected)/(workspace)/_components/WorkspaceShell.tsx`           |
| workspace route 전용 사이드바    | `src/app/(protected)/(workspace)/_components/sidebar/WorkspaceSidebar.tsx` |
| 실제 세션 조회·상태 해석         | `src/features/auth/client/AuthProvider.tsx`                                |
| 검증 결과 기반 UI 경계           | `src/features/auth/ui/AuthGuard.tsx`                                       |
| API refresh·만료 처리            | `src/shared/lib/apiClient.ts`                                              |
| 상세 인증 lifecycle              | [인증 아키텍처](./auth-architecture.md)                                    |
