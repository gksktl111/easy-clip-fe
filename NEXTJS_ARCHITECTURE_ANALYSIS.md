# Next.js App Router 아키텍처 개선 제안서

> 작성일: 2026-08-26
>
> 대상: `next@16.1.1`, React 19, TanStack Query 5
>
> 목적: Easy Clip을 클라이언트 중심 SPA 흐름에서 **서버 우선 라우트 진입 + 필요한 곳만 클라이언트 상호작용** 구조로 점진 전환한다.

## 요약

이 프로젝트는 이미 App Router, feature 단위 모듈, DTO, TanStack Query query/mutation 분리 등 좋은 기반을 갖추고 있다. 다만 핵심 화면의 실제 흐름은 아래에 가깝다.

```text
서버 page/layout (경로 조합)
  → 클라이언트 SessionProvider가 세션 복구
  → 클라이언트 AuthGuard가 접근 제어
  → 클라이언트 화면 훅이 TanStack Query로 API 요청
  → 클라이언트에서 목록/상태 렌더링
```

따라서 `page.tsx`와 `layout.tsx`는 대부분 Server Component이지만, 서버가 경로의 초기 데이터를 가져와 Client Component에 전달하는 패턴은 초기 설정을 제외하면 거의 사용하지 않는다. 목표는 TanStack Query를 제거하는 것이 아니라, **첫 화면에 필요한 읽기 데이터는 서버에서 준비하고, 이후 상호작용·무한 스크롤·mutation은 클라이언트가 담당**하도록 경계를 조정하는 것이다.

가장 먼저 개선할 대상은 인증된 폴더 화면이다. 폴더 목록과 첫 페이지 클립을 서버에서 확인·조회한 뒤 기존 React Query 캐시에 hydrate하면, 현재의 클라이언트 세션 복구 및 연쇄 요청을 줄이면서 복사·붙여넣기·드래그·컨텍스트 메뉴 같은 브라우저 기능은 그대로 유지할 수 있다.

## 현재 구조와 데이터 흐름

### 현재 보호 화면 흐름

```text
브라우저 요청
  → src/proxy.ts
      └ 쿠키 존재 여부만으로 빠른 리다이렉트
  → src/app/layout.tsx (Server Component)
      └ 쿠키 확인 + 사용자 설정 조회
  → QueryProvider / AppSettingsProvider / SessionProvider (Client Component)
  → (app)/layout.tsx
      └ AuthGuard / AppShell (Client Component)
  → route page (Server Component, 대개 클라이언트 진입 UI만 반환)
  → useSession + useQuery/useInfiniteQuery (Client Component)
  → 외부 백엔드 API
```

근거가 되는 대표 경로는 다음과 같다.

| 구분        | 현재 구현                                                                                        | 관찰                                                                        |
| ----------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| 서버 초기화 | `src/app/layout.tsx`, `src/features/settings/server/getInitialUserSettings.ts`                   | 쿠키와 `/users/me/settings`는 서버에서 읽는다.                              |
| 세션 복구   | `src/app/providers/session/SessionProvider.tsx`                                                  | 실제 사용자 프로필 검증은 hydration 후 브라우저에서 `/users/me`를 호출한다. |
| 보호 화면   | `src/app/(app)/layout.tsx`, `src/app/_components/AuthGuard.tsx`                                  | 서버 레이아웃이지만 즉시 클라이언트 인증 경계로 진입한다.                   |
| 클립 목록   | `src/features/clip/ui/RecentClipsPage.tsx`, `src/features/clip/queries/useInfiniteClipsQuery.ts` | 클라이언트 TanStack Query가 목록을 요청한다.                                |
| 폴더 목록   | `src/features/folder/hooks/useFoldersQuery.ts`                                                   | 사이드바와 진입 페이지가 클라이언트에서 폴더를 조회한다.                    |
| 휴지통      | `src/app/(app)/_components/TrashRoute.tsx`, `src/features/trash/hooks/useTrashItemsQuery.ts`     | 클라이언트 wrapper와 무한 query가 조회를 시작한다.                          |

### 이미 잘 되어 있는 점

- `src/app → src/features → src/shared`의 큰 의존성 방향이 잡혀 있고, API·model·query·mutation·UI를 feature 안에서 나누고 있다.
- 브라우저 전용 기능(clipboard, event handler, Zustand, TanStack Query)은 `"use client"` 경계 안에 있다.
- `src/features/settings/server`, `src/features/auth/server`가 `server-only`를 사용해 서버 전용 초기화의 선례를 만들었다.
- query key와 mutation 후 invalidate가 이미 여러 feature에 존재한다. 초기 서버 데이터를 React Query에 연결할 기반이 있다.
- `src/proxy.ts`가 인증 쿠키가 없는 요청을 빠르게 막고, 클라이언트 `apiClient`가 토큰 갱신과 401 처리를 담당한다.

## 개선이 필요한 지점

### 1. Server Component가 데이터 경계가 아니라 경로 조합 역할에 머문다

예를 들어 `src/app/(app)/recent/page.tsx`는 `RecentEntryPage`만 반환한다. 이후 `RecentEntryPage`가 클라이언트에서 폴더 목록을 가져와 첫 폴더로 리다이렉트하고, 최종 목록 화면이 다시 클라이언트에서 클립을 요청한다.

이 방식은 초기 표시까지 다음 대기열을 만들 수 있다.

```text
HTML/RSC 응답
  → JavaScript hydration
  → 세션 복구 요청
  → 폴더 목록 요청
  → 클라이언트 리다이렉트
  → 클립 목록 요청
```

모든 요청이 항상 순차적이라는 뜻은 아니지만, 첫 화면의 핵심 데이터가 브라우저에서 준비될 때까지 표시되지 않는 구조다. 서버가 이미 요청 쿠키에 접근할 수 있으므로, 경로 진입에 필요한 사용자·폴더·첫 목록 페이지는 서버에서 조회할 수 있다.

### 2. 루트 레이아웃의 요청별 설정 조회가 공개 경로까지 동적으로 만든다

`src/app/layout.tsx`는 모든 경로에서 `cookies()`와 사용자 설정 API를 사용한다. `cookies()` 같은 Dynamic API를 루트에서 읽으면 랜딩·요금제 등 공개 경로도 요청별 렌더링 경로가 된다.

개인화한 테마/언어를 첫 바이트부터 반영하는 선택 자체는 유효하다. 다만 공개 마케팅 페이지를 정적으로 제공하거나 강하게 캐시하려는 목표와는 충돌한다. 이 결정을 명시적으로 분리해야 한다.

### 3. 인증은 서버의 힌트와 클라이언트의 실제 검증으로 나뉘어 있다

`src/proxy.ts`와 `hasAuthSessionCookie()`는 쿠키의 존재만 본다. 실제 세션 유효성은 `SessionProvider`가 브라우저에서 `/users/me`를 호출한 뒤 확정한다. 이 때문에 보호 화면의 초기 콘텐츠가 `AuthGuard`의 로딩 상태 뒤에 머문다.

서버 렌더링을 늘리려면 보호 layout 또는 route loader가 서버에서 현재 사용자를 검증하고, 그 결과를 `SessionProvider`의 초기값으로 전달해야 한다. 단, 백엔드의 refresh cookie 재발급 응답을 Server Component가 브라우저에 그대로 전달할 수 있는지는 별도 계약 검토가 필요하다.

### 4. 동적 폴더 경로의 식별자를 클라이언트에서 읽는다

`src/app/(app)/[id]/page.tsx`는 `params`를 사용하지 않고, `src/features/clip/hooks/useFolderClipsPage.ts`가 `useParams()`로 폴더 ID를 읽는다. 그 결과 서버는 폴더의 존재·소유권을 먼저 확인하거나 `notFound()`로 404를 만들 수 없다.

동적 세그먼트 이름도 `[id]`보다 `[folderId]`가 의도를 더 분명하게 나타낸다. URL은 유지한 채 디렉터리명과 타입만 바꿀 수 있다.

### 5. App Router의 경로 단위 로딩·오류·404 UI가 없다

`src/app`에는 현재 `loading.tsx`, `error.tsx`, `not-found.tsx`, `global-error.tsx`가 없다. 각 클라이언트 query의 로딩/오류 상태는 존재하지만, 서버 데이터 조회·동적 경로 전환·예상하지 못한 segment 오류를 처리하는 App Router 경계는 없다.

서버 우선 전환 후에는 특히 다음이 필요하다.

- `src/app/(app)/[folderId]/loading.tsx`: 동적 폴더 전환의 즉시 feedback 및 부분 prefetch 지원
- `src/app/(app)/error.tsx`: 보호 앱 영역의 예상하지 못한 오류 복구
- `src/app/not-found.tsx`: 존재하지 않는 폴더나 잘못된 경로의 안내
- 필요 시 `src/app/global-error.tsx`: root layout까지 실패한 경우의 최후 경계

### 6. 서버용 요청 계층이 일반화되어 있지 않다

`src/shared/lib/apiClient.ts`는 `window`, 인증 갱신 이벤트, 브라우저 쿠키 포함 요청을 전제로 한다. 따라서 Server Component에서 재사용하기에 적합하지 않다. 현재 설정 조회만 `getInitialUserSettings()` 안에서 cookie header를 직접 조립해 별도 `fetch`를 수행한다.

서버 요청은 별도 `server-only` 모듈로 분리해야 한다. 이 모듈은 들어온 요청의 cookie를 백엔드로 전달하고, 브라우저의 refresh 재시도나 DOM 이벤트에는 의존하지 않아야 한다.

### 7. i18n 초기화 경로가 서버와 클라이언트에서 다르다

`src/i18n/request.ts`의 `getInitialLocale()`은 현재 기본 로케일을 반환하고, 반면 `AppSettingsProvider`는 서버 설정/cookie로 전달받은 언어를 기반으로 네 개의 메시지 JSON을 모두 정적 import한다.

현재는 번역 호출의 상당수가 클라이언트에 있어 문제가 크게 드러나지 않지만, Server Component에서 번역을 사용하기 시작하면 서버와 클라이언트의 로케일 원천을 하나로 맞춰야 한다. 또한 메시지 번들 크기는 실제 build 결과로 확인하되, 런타임 선택을 위해 모든 언어 파일을 정적 import하는 방식도 함께 재검토할 대상이다.

### 8. 공개 페이지의 정적 콘텐츠와 상호작용 경계가 더 작아질 수 있다

`MarketingShell`은 테마 토글과 세션 상태 때문에 Client Component이다. 이 자체가 잘못된 것은 아니며, Client Component의 `children`으로 전달한 Server Component가 모두 클라이언트 모듈이 되는 것도 아니다. 다만 공개 랜딩/요금제의 정적 섹션, header의 테마 토글, 로그인 상태별 CTA, 구독 mutation을 더 작은 경계로 나누면 전송 JavaScript와 요청별 렌더링 범위를 줄일 여지가 있다.

### 9. 폴더 전환이 경로 이동 뒤 클라이언트 목록 조회로 이어진다

현재 사이드바의 `FolderSidebarItem`은 `Link`로 `/${folder.id}`로 이동한다. 클릭 핸들러가 목록 데이터를 `await`하거나 이동을 막는 구조는 아니다. 그러나 `src/app/(app)/[id]/page.tsx`는 `params`를 사용하지 않은 채 Client Component만 반환하고, 이후 `useFolderClipsPage()`가 `useParams()`로 ID를 다시 읽어 `useInfiniteClipsQuery`를 실행한다.

이 흐름에서는 동적 route가 서버 데이터 경계 역할을 하지 못한다. 특히 아래 요소가 첫 폴더 이동을 느리게 느끼게 할 수 있다.

- `[id]` route에 `loading.tsx`가 없어 동적 route의 즉시 feedback과 부분 prefetch를 활용하지 못한다.
- 폴더 ID가 바뀌어도 `placeholderData: (previousData) => previousData`가 이전 폴더 목록을 계속 보여 준다.
- `isPlaceholderData`나 일반 fetch 상태가 목록 UI까지 전달되지 않아, 새 폴더를 읽는 중이라는 상태를 표시할 수 없다.
- cache miss마다 `MIN_LOADING_MS = 300`이 적용되어 실제 네트워크 대기 외의 지연이 추가된다.

따라서 URL과 활성 메뉴는 바뀌었지만 본문에 이전 폴더 내용이 남아 있다가 새 요청 완료 시점에 교체될 수 있다. 사용자가 "데이터 패칭이 완료된 뒤에야 이동한다"고 느끼는 원인 후보다. 실제 배포 환경에서는 전환 전후의 RSC 요청, 클립 API 요청, 캐시 상태를 측정해 원인을 확정한다.

이 문제를 해결하기 위해 `Link`를 단순한 클라이언트 상태 변경으로 대체하는 것을 목표로 삼지 않는다. URL의 직접 진입·새로고침·뒤로 가기·공유 가능성을 유지하면서 Next.js의 서버 최초 조회 이점을 얻기 위해, 아래의 서버 우선 route 전환을 후속 개선 과제로 둔다.

## 목표 구조

### 역할 분리 원칙

| 책임                                              | 기본 위치                                  | 예시                                                   |
| ------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------ |
| 요청 cookie/headers 읽기, 인증된 최초 데이터 조회 | Server Component 또는 feature `server/`    | 현재 사용자, 폴더 존재 확인, 첫 클립 페이지            |
| 경로 params 검증, redirect, not-found             | `src/app`의 async page/layout              | `/favorites`의 첫 폴더 redirect, 잘못된 `folderId` 404 |
| 서버 전용 HTTP transport                          | `src/shared/server` 또는 feature `server/` | cookie 전달, 서버 API 오류 변환                        |
| 첫 화면 이후 캐시, 무한 스크롤, polling           | TanStack Query Client Component            | 다음 페이지 클립, 사용자 수동 새로고침                 |
| mutation 및 즉시 UI 반응                          | TanStack Query mutation Client Component   | 클립 생성/삭제, 폴더 순서 변경                         |
| browser API 및 상호작용                           | Client Component                           | clipboard paste, 드래그앤드롭, modal, Toss SDK         |
| 정적 마케팅 콘텐츠                                | Server Component 우선                      | 랜딩 섹션, 요금제 설명, footer                         |

### 목표 보호 화면 흐름

```text
브라우저 요청
  → proxy: 쿠키 부재만 빠르게 차단
  → (app) async layout: 서버에서 현재 사용자 검증
  → async page: params 검증 + 화면에 필요한 첫 데이터 병렬 조회
  → HydrationBoundary 또는 직렬화 가능한 initial props
  → 작은 Client Component: interaction + React Query 후속 페이지/mutation
  → 백엔드 API
```

여기서 `proxy`는 보안의 최종 판단자가 아니다. 빠른 경로 전환 역할을 유지하고, 서버 loader와 백엔드가 실제 사용자·리소스 소유권을 확인해야 한다.

### 권장 파일 배치 예시

아래는 목표 책임을 설명하기 위한 예시다. 모든 파일을 한 번에 옮기지 않고, 경로 하나를 전환할 때 필요한 파일만 추가한다.

```text
src/
  app/
    layout.tsx                         # 전역 HTML, 공통 metadata, CSS
    (marketing)/
      page.tsx
      pricing/page.tsx
    (app)/
      layout.tsx                       # 서버 사용자 검증 + 보호 영역 bootstrap
      [folderId]/
        page.tsx                       # 서버 params 검증 + 첫 클립 페이지 preload
        loading.tsx
        error.tsx
      favorites/page.tsx               # 서버에서 첫 폴더로 redirect
      recent/page.tsx                  # 서버에서 첫 폴더로 redirect
      trash/page.tsx                   # 서버 첫 페이지 preload
  features/
    auth/server/getCurrentUser.ts
    folder/server/getFolders.ts
    clip/server/getFolderClipPage.ts
    trash/server/getTrashPage.ts
  shared/
    server/apiRequest.ts               # server-only cookie-forwarding transport
    providers/QueryProvider.tsx
```

`[folderId]`는 기존 `[id]`와 URL 결과가 같으므로 외부 링크를 깨지 않는다. 단, 이동 시 모든 `useParams`, 테스트, 타입을 함께 변경한다.

## 우선순위별 변경 제안

| 우선순위 | 변경                                                     | 기대 효과                                                | 완료 기준                                                                                             |
| -------- | -------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| P0       | 서버 전용 API client 도입                                | Server Component가 안전하게 백엔드 API를 조회            | `server-only`, cookie forwarding, 오류 타입, 단위 테스트를 갖춘다.                                    |
| P0       | 서버에서 현재 사용자 검증 후 SessionProvider 초기화      | 보호 화면의 hydration 후 세션 복구 대기를 줄임           | 유효하지 않은 cookie는 서버에서 로그인으로 전환하고, 유효 사용자는 초기 session prop으로 시작한다.    |
| P1       | P0 완료 후 사이드바 폴더 전환을 서버 우선 route로 전환   | 첫 폴더 목록 표시와 동적 route 전환을 함께 개선          | `Link → server params/권한 확인/첫 목록 조회 → React Query hydrate → client 후속 조회` 흐름을 만든다. |
| P1       | `/favorites`, `/recent`의 첫 폴더 redirect를 서버로 이동 | 폴더 query 후 클라이언트 redirect 제거                   | 폴더가 있으면 서버 redirect, 없으면 빈 화면을 서버에서 결정한다.                                      |
| P1       | `loading.tsx`·`error.tsx`·`not-found.tsx` 추가           | 서버 전환과 경로 오류에 일관된 UX 제공                   | 동적 폴더, 보호 영역, 전역 404가 각각 복구 경계를 가진다.                                             |
| P1       | 서버 데이터와 React Query 캐시 동기화 규칙 정의          | mutation 뒤 RSC와 클라이언트 캐시의 불일치 방지          | mutation별 query invalidate와 필요한 `router.refresh()`/재검증 정책을 문서화한다.                     |
| P2       | root provider와 공개/보호 route group 분리               | 공개 경로의 동적 범위 및 client bootstrap 축소           | 공개 페이지의 개인화 전략을 결정하고 root의 요청별 의존성을 최소화한다.                               |
| P2       | i18n의 서버·클라이언트 로케일 원천 통합                  | Server Component 전환 시 언어 불일치 방지                | cookie 또는 locale segment 중 하나를 기준으로 server/client가 같은 locale을 사용한다.                 |
| P2       | route별 metadata와 robots 정책 추가                      | 공개 페이지의 검색 노출과 보호 페이지 비노출을 명확히 함 | 랜딩/요금제 metadata, 인증 화면 및 앱 영역 `noindex` 정책을 검토·반영한다.                            |
| P3       | `"use client"` 경계 감사                                 | 불필요한 클라이언트 모듈 축소                            | 실제 browser API/상태/이벤트가 없는 상위 경계를 작게 만든다.                                          |

## 권장 전환 순서

### 0단계: 기준선 확보

변경 전 아래 항목을 기록한다.

- `/[folderId]`, `/favorites`, `/recent`, `/trash`의 초기 API 요청 순서와 횟수
- hydration 전후 loading 화면, 클라이언트 redirect 발생 여부
- production build의 route rendering 결과와 client bundle 크기
- 인증 cookie가 유효/만료/부재인 경우의 응답과 redirect

성능 개선은 이 기준선과 비교해 판단한다. 단지 Server Component 수가 늘었다는 사실만으로 개선됐다고 결론 내리지 않는다.

### 1단계: 서버 전용 transport와 인증 bootstrap 만들기

`src/shared/server/apiRequest.ts` 같은 `server-only` 모듈을 추가한다.

- `cookies()` 또는 request header에서 전달받은 cookie를 백엔드 호출에 명시적으로 전달한다.
- 사용자별 요청은 `cache: "no-store"`를 명시한다. Next.js 16에서 `fetch`는 기본적으로 영구 캐시되지 않지만, 개인정보·인증 데이터라는 의도를 코드에 명확히 남긴다.
- 브라우저용 `src/shared/lib/apiClient.ts`의 `window` 이벤트, refresh 재시도, `credentials: "include"` 구현은 서버 모듈로 옮기지 않는다.
- `getCurrentUser()`를 feature `auth/server`에 두고 401/403을 보호 layout의 redirect 정책으로 변환한다.
- `SessionProvider`가 `initialSession` 또는 검증된 초기 user를 받을 수 있게 확장한다. 기존 브라우저 refresh 처리와 중복되지 않도록 초기 상태 전이도 함께 설계한다.

백엔드가 서버 조회 중 refresh cookie를 갱신해야 하는 계약이라면, Server Component만으로는 응답의 `Set-Cookie`를 브라우저에 전달하지 못할 수 있다. 이 경우는 다음 중 하나를 먼저 결정한다.

1. 서버 최초 조회는 access cookie가 유효할 때만 수행하고 401이면 로그인으로 보낸다.
2. Next Route Handler/BFF가 refresh 응답의 cookie를 전달하도록 한다.
3. 첫 인증 복구만 기존 클라이언트 흐름으로 남긴다.

이 선택 없이 server auth를 전면 전환하지 않는다.

### 2단계: 폴더 상세 화면을 대표 경로로 전환

대상은 현재 `src/app/(app)/[id]/page.tsx`와 `src/features/clip/hooks/useFolderClipsPage.ts`다.

이 단계의 목표 전환 흐름은 아래와 같다.

```text
사이드바 FolderSidebarItem의 Link(/${folderId})
  → async app/(app)/[folderId]/page.tsx
  → params 검증 + 서버 인증/폴더 접근 권한 확인
  → 폴더 정보와 첫 클립 페이지 서버 조회
  → HydrationBoundary 또는 initialData로 Client Component에 전달
  → Client Component는 folderId를 prop으로 받아 렌더링
  → React Query가 무한 스크롤·필터·mutation·후속 최신화를 담당
```

즉, 사이드바의 각 항목은 계속 URL과 `folderId`를 가진 `Link`로 둔다. 오른쪽 목록 영역은 `useParams()`로 ID를 다시 읽어 최초 데이터를 요청하는 대신, 서버 page가 검증한 `folderId`와 hydrate된 첫 데이터를 받아 시작한다. 클라이언트 전용 같은 페이지 상태로 ID만 바꾸는 방식은 이 목표에서는 선택하지 않는다. 해당 방식은 빠른 전환에는 유리할 수 있지만 URL 동기화·직접 진입·새로고침 처리와 서버 최초 조회를 별도로 다시 설계해야 한다.

#### 착수 조건

이 작업은 바로 착수하지 않고, 다음 선행 과제가 갖춰진 뒤 진행한다.

1. 1단계의 서버 전용 transport와 서버 인증 bootstrap을 완료한다.
2. 서버와 클라이언트가 동일한 clips query key·응답 형태를 사용하도록 hydrate 계약을 확정한다.
3. `[folderId]/loading.tsx`, 오류/404 정책을 추가해 네트워크 대기와 접근 불가 상태를 명확히 보여 준다.
4. 폴더 생성·삭제·이동 mutation 뒤 React Query invalidate와 필요 시 `router.refresh()`를 어떻게 조합할지 정한다.
5. 배포 환경의 첫 폴더 전환을 측정해 `MIN_LOADING_MS` 유지·축소·제거와 hover/focus prefetch 필요성을 판단한다.

#### 구현 항목

1. route segment를 `[folderId]`로 명확히 한다.
2. async page에서 `params.folderId`를 읽고, 서버 loader로 폴더 존재·접근 권한을 확인한다.
3. 폴더 메타데이터, 폴더 목록, 첫 클립 페이지를 필요한 범위에서 병렬 조회한다.
4. 존재하지 않거나 접근할 수 없으면 정책에 맞게 `notFound()` 또는 인증 오류 처리한다. 다른 사용자의 리소스 존재를 노출하지 않도록 404 정책을 우선 검토한다.
5. 기존 `useInfiniteClipsQuery`와 동일한 query key/options로 첫 페이지를 hydrate하거나, 직렬화 가능한 `initialData`를 Client Component에 전달한다.
6. 붙여넣기, 선택 삭제, 컨텍스트 메뉴, 즐겨찾기, 무한 스크롤은 Client Component에 남긴다.

이 단계가 끝나면 다음 페이지 클립은 기존 `useInfiniteQuery`가 요청하고, 첫 페이지는 서버에서 준비된 데이터가 보여야 한다. 브라우저에서 동일한 첫 페이지 API가 한 번 더 호출되지 않는지도 확인한다.

### 3단계: 보호 layout과 기본 진입 경로 전환

- `src/app/(app)/layout.tsx`에서 서버 검증된 user와 공통 초기 데이터를 준비한다.
- 사이드바가 사용하는 폴더 목록은 가능한 한 보호 layout의 bootstrap data 또는 hydrate된 cache를 사용해 별도의 첫 로딩을 피한다.
- `/favorites`, `/recent`은 클라이언트 `useEffect` redirect 대신 서버에서 첫 폴더를 조회해 `redirect()`한다.
- 폴더가 없을 때만 필요한 빈 상태는 명시적 Server/Client 화면으로 분기한다.

Next.js layout은 client navigation 때 항상 다시 렌더링되는 데이터 컨테이너로 취급하면 안 된다. 폴더 생성·삭제 같은 mutation 뒤 현재 화면에서 서버 결과를 즉시 다시 써야 하면 query invalidation만으로 충분한지, `router.refresh()` 또는 서버 재검증이 필요한지 변경별로 결정한다.

### 4단계: 휴지통과 구독을 같은 원칙으로 확장

- `/trash`: 첫 휴지통 페이지와 폴더 참조는 서버에서 준비하고, 선택·복원·영구 삭제·추가 페이지는 클라이언트에 둔다.
- `/pricing`: 정적 요금제 설명은 Server Component 우선으로 두고, 현재 구독 상태에 따른 버튼 및 취소 modal만 Client Component에 남긴다.
- `/billing`: Toss SDK 호출, viewport, confetti는 브라우저 책임이므로 Client Component를 유지한다. 결제 승인 요청을 서버로 옮길지는 Toss/백엔드 계약을 별도로 검토한 뒤 결정한다.

### 5단계: 공개 경로, i18n, metadata 최적화

공개 랜딩과 요금제 화면에 대해 다음 중 하나를 제품 결정으로 선택한다.

| 선택                                | 장점                           | 대가                                                              |
| ----------------------------------- | ------------------------------ | ----------------------------------------------------------------- |
| 첫 응답부터 사용자 테마·언어 적용   | 개인화된 첫 화면               | cookie 기반 요청별 렌더링을 유지한다.                             |
| 공개 화면을 정적/캐시 우선으로 제공 | 빠른 CDN 제공과 낮은 서버 비용 | 테마/언어는 클라이언트에서 적용하거나 locale URL을 도입해야 한다. |

두 경우 모두 `src/i18n/request.ts`와 `AppSettingsProvider`가 같은 locale 원천을 읽도록 정리한다. route locale을 도입한다면 `/[locale]/...`의 SEO·redirect·기존 URL 마이그레이션까지 별도 작업으로 계획한다.

## 서버 데이터와 React Query의 공존 규칙

서버 우선으로 전환해도 React Query는 계속 필요하다. 다음 규칙을 팀 공통 기준으로 둔다.

1. **초기 route 데이터**: async page/layout에서 서버 조회한다. 최초 표시가 중요한 데이터만 preload한다.
2. **초기 cache 연결**: 같은 query key와 데이터 형태를 사용해 hydrate한다. 서버 DTO와 클라이언트 화면 모델의 변환 위치를 한쪽으로 일관되게 정한다.
3. **후속 조회**: 무한 스크롤, 수동 재시도, focus 이후 최신화는 `useQuery`/`useInfiniteQuery`가 담당한다.
4. **mutation 성공 후**: 기존 query invalidation/optimistic update를 유지한다. 현재 RSC 출력도 즉시 최신 상태여야 할 때만 `router.refresh()` 또는 서버 재검증을 추가한다.
5. **캐시 범위**: 인증 사용자 데이터에는 사용자 ID를 query key에 포함하고, 서버 `fetch`에는 공유 캐시를 의도적으로 켜지 않는다. public data만 `force-cache`, `revalidate`, tag 기반 재검증을 검토한다.
6. **중복 요청 검증**: hydration 뒤 첫 페이지 query가 네트워크 요청을 다시 보내지 않는 것을 브라우저 Network와 자동화 테스트로 확인한다.

## Server Actions와 Route Handler의 사용 기준

Next.js답게 만들기 위해 모든 mutation을 Server Action으로 옮길 필요는 없다.

- **유지할 것**: clipboard, drag-and-drop, file upload, Toss SDK, 즉시 optimistic UI처럼 브라우저 상태와 강하게 결합된 현재의 React Query mutation.
- **검토할 것**: 단순 폼 제출과 서버 재검증이 핵심인 기능, 브라우저에 백엔드 계약을 노출할 이유가 없는 기능.
- **Route Handler/BFF를 검토할 조건**: 서버에서 refresh cookie를 브라우저로 전달해야 하거나, 백엔드 API 주소·헤더 정책을 브라우저에서 숨겨야 하거나, 여러 백엔드 호출을 하나의 웹 계약으로 합쳐야 할 때.

현재처럼 별도 백엔드 API가 있고 클라이언트가 httpOnly cookie 인증과 refresh를 이미 관리하는 구조에서는, Server Action 도입 자체보다 **서버 읽기 계층과 캐시 무효화 정책을 먼저 명확히 하는 것**이 우선이다.

## 검증 계획

각 전환 PR에서 최소한 다음을 확인한다.

- 단위 테스트: server API transport의 cookie forwarding, 401/403/5xx 변환, 폴더 접근 불가 처리
- 컴포넌트/통합 테스트: hydrate된 첫 데이터가 loading 없이 표시되고, 이후 `fetchNextPage`가 정상 동작하는지 확인
- Playwright: 로그인 cookie 유무, 잘못된 폴더 경로, 폴더 없음, 목록 실패, 폴더 삭제 뒤 redirect를 검증
- 브라우저 Network: 첫 목록/폴더 요청의 중복 여부와 클라이언트 redirect 제거 여부 확인
- 정적 검사: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`
- 공개 경로를 정적화하는 단계에서는 production build의 route rendering 결과와 bundle 분석 결과를 함께 기록

## 완료 상태의 판정 기준

다음이 충족되면 핵심 전환이 완료된 것으로 본다.

- 인증된 폴더 route는 서버에서 `folderId`를 읽고 접근 가능 여부를 결정한다.
- 첫 폴더/클립 목록은 hydration 전부터 준비되며, 같은 첫 페이지 API를 브라우저가 중복 요청하지 않는다.
- `/favorites`, `/recent`이 클라이언트 effect가 아닌 서버 redirect로 첫 폴더 경로를 결정한다.
- `loading.tsx`, `error.tsx`, `not-found.tsx`가 보호 앱의 서버 전환과 실패를 다룬다.
- Client Component는 browser API, 이벤트, 로컬 상태, React Query 후속 fetch/mutation에 필요한 최소 경계에 머문다.
- 사용자별 서버 데이터는 명시적으로 non-cache 처리되고, 공개 데이터만 의도적으로 캐시 전략을 가진다.
- mutation 후 현재 화면의 RSC 데이터와 React Query cache가 어떤 방식으로 동기화되는지 기능별로 설명할 수 있다.

## 참고 자료

- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js App Router 데이터 조회](https://nextjs.org/docs/app/getting-started/fetching-data)
- [Next.js fetch 캐시 API](https://nextjs.org/docs/app/api-reference/functions/fetch)
- [Next.js 오류 처리](https://nextjs.org/docs/app/getting-started/error-handling)
- [Next.js 동적 경로 전환과 loading UI](https://nextjs.org/docs/app/getting-started/linking-and-navigating)
