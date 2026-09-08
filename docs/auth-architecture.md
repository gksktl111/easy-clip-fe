# 인증 아키텍처

> 기준일: 2026-08-28
> 조사 범위: easy-clip-fe의 실제 import·호출 관계와 인접 저장소 easy-clip-be의 OAuth, cookie, refresh, logout 구현
> **확인 필요:** 이 문서는 런타임 환경변수의 실제 값은 다루지 않는다. 배포 환경의 cookie domain·CORS origin 값은 별도 확인이 필요하다.

## 1. 인증 아키텍처 개요

현재 인증은 **OAuth 로그인 + httpOnly access/refresh cookie + /users/me React Query** 구조다.

- 프런트엔드는 OAuth 시작 URL로 전체 페이지 이동을 한다.
- 백엔드는 OAuth callback에서 access·refresh cookie를 발급하고 프런트엔드 /favorites로 redirect한다.
- 이후 프런트엔드는 모든 API 요청에 cookie를 포함하고, 현재 사용자 정보는 GET /users/me 결과를 React Query cache에 저장한다.
- AuthProvider는 이 Query 결과를 화면이 소비할 AuthStatus와 AuthContext 값으로 해석한다.
- AuthGuard는 보호 경로에서 그 상태를 바탕으로 렌더링과 fallback routing을 결정한다.
- apiClient는 모든 API 요청의 공통 창구로서 401에 대한 refresh·재시도와 인증 만료 이벤트만 담당한다.

### Server State와 Client/Auth State

| 구분 | 단일 원천 | 현재 코드에서의 책임 |
| --- | --- | --- |
| 서버 세션·토큰·인가 | 백엔드 | JWT 검증, refresh token 세션 검증/회전/폐기, OAuth cookie 발급·제거, 리소스 인가 |
| 현재 사용자 Server State | React Query의 auth/current-user cache | /users/me 응답과 조회 상태·오류 보관 |
| Client/Auth lifecycle state | AuthProvider의 isAuthQueryEnabled | 최초 세션 복구 허용 여부와 인증 종료 후 재조회 방지 |
| 화면용 인증 계약 | AuthContext | Query를 복제하지 않고 user, status, error, restoreSession, logout 제공 |
| 경로 UI 정책 | AuthGuard, useLogout, 로그인 페이지 컨트롤러 | 보호 경로 fallback, 사용자 의도 로그아웃 후 이동, 로그인 페이지의 인증 사용자 이동 |

isAuthQueryEnabled는 사용자 정보를 저장하는 state가 아니다. Query cache를 비운 직후 현재 사용자 Query가 다시 실행되는 것을 막는 인증 lifecycle 제어 값이다.

### 실제 import·호출 관계

~~~mermaid
flowchart LR
  Layout["app/layout.tsx"] --> QueryProvider["shared/providers/QueryProvider"]
  Layout --> CookieHint["auth/server/hasAuthSessionCookie"]
  QueryProvider --> Provider["auth/client/AuthProvider"]
  Provider --> UseQuery["useCurrentUserQuery"]
  Provider --> QueryOptions["currentUserQueryOptions"]
  UseQuery --> QueryOptions
  QueryOptions --> AuthService["restoreSessionFromRefreshCookie"]
  AuthService --> AuthApi["authApi.fetchMyProfile"]
  AuthApi --> ApiClient["shared/lib/apiClient"]
  ApiClient --> Backend["easy-clip-be API"]
  Provider --> Context["AuthContext"]
  ProtectedLayout["app/(protected)/layout.tsx"] --> Guard["AuthGuard"]
  Guard --> UseAuth["useAuth"]
  UseAuth --> Context
  ApiClient -. auth-session:expired .-> Provider
~~~

AuthProvider → Query → API client → 백엔드는 서버 상태를 읽는 흐름이고, AuthProvider → AuthContext → AuthGuard는 그 결과를 UI 정책에 전달하는 흐름이다.

## 2. 주요 구성 요소

| 구성 요소 | 실제 역할과 책임 |
| --- | --- |
| AuthProvider | 현재 사용자 Query를 시작할지 결정하고, Query 상태를 AuthStatus로 변환한다. restoreSession, logout, auth-session:expired 구독, clearClientSession을 관리한다. router를 사용하지 않는다. |
| AuthContext | status, user, error, restoreSession, logout이라는 최소 소비 계약이다. 자체 state나 API 호출은 없다. |
| useCurrentUserQuery | currentUserQueryOptions와 enabled를 조합한 useQuery다. 현재 사용자의 data·fetching·error는 React Query가 관리한다. |
| currentUserQueryOptions | key를 [auth, current-user]로 고정하고 query function을 restoreSessionFromRefreshCookie로 지정한다. retry는 false다. |
| authSessionState | ApiError의 401·404를 미인증으로 분류하고, Query 상태를 idle/initializing/authenticated/unauthenticated/error로 변환한다. |
| apiClient | credentials: include로 요청하고, 일반 API의 401에서 refresh를 공유 Promise로 한 번 수행한 뒤 원 요청을 한 번 재시도한다. 최종 만료 사실을 browser event로 알린다. |
| subscribeToAuthExpired | window의 auth-session:expired 이벤트를 구독하고 해제 함수를 반환한다. AuthProvider가 이를 통해 API 계층의 만료 사실을 lifecycle 정리에 연결한다. |
| AuthGuard | 보호 layout 안에서 인증 상태별 UI와 미인증 fallback redirect를 결정한다. cache나 서버 세션을 조작하지 않는다. |
| 로그인/로그아웃 API | 프런트엔드 authApi는 OAuth 시작 경로, /users/me, /auth/logout을 제공한다. 백엔드는 OAuth callback·refresh·logout에서 cookie와 서버 세션을 실제로 처리한다. |
| proxy.ts | cookie **존재 여부**만 보고 빠른 1차 진입 경로를 정한다. cookie 유효성이나 사용자 존재 여부는 판정하지 않는다. |

authApi.refreshAccessToken도 export되어 있지만, 현재 호출 흐름에서 refresh는 이 함수를 거치지 않고 apiClient 내부가 직접 POST /auth/refresh를 요청한다.

## 3. 초기 세션 복구 흐름

### 실제 흐름

~~~mermaid
sequenceDiagram
  autonumber
  participant Browser
  participant Next as Next.js proxy / RootLayout
  participant Provider as AuthProvider
  participant RQ as React Query
  participant API as apiClient
  participant BE as Backend /users/me
  participant Guard as AuthGuard

  Browser->>Next: 보호 경로 요청
  Next->>Next: proxy가 access/refresh cookie 이름 존재 여부 확인
  alt cookie가 전혀 없음
    Next-->>Browser: /login으로 redirect
  else cookie가 하나 이상 있음
    Next->>Next: RootLayout의 hasAuthSessionCookie()
    Next->>Provider: shouldRestoreSession=true
    Provider->>RQ: useCurrentUserQuery(enabled=true)
    RQ->>API: GET /users/me
    API->>BE: cookie 포함 요청
    BE-->>API: 프로필 또는 인증 오류
    API-->>RQ: AuthSession 또는 ApiError
    RQ-->>Provider: cache data / query state
    Provider->>Provider: getAuthStatus()로 해석
    Provider-->>Guard: AuthContext 갱신
    Guard-->>Browser: authenticated면 자식 렌더링
  end
~~~

RootLayout은 hasAuthSessionCookie()로 두 cookie 이름 중 하나라도 있으면 shouldRestoreSession=true를 전달한다. 이 값은 **초기화 힌트**일 뿐이다. 실제 유효성은 GET /users/me에서 다음처럼 확인된다.

1. 프런트엔드 fetchMyProfile()이 apiClient를 통해 요청한다.
2. 백엔드 UsersController.getMe의 JwtAccessGuard가 access token을 검증한다.
3. 통과한 경우 GetMeUseCase가 user와 현재 auth account를 찾고 프로필을 반환한다.
4. 프런트엔드 syncSessionProfile()이 응답을 AuthSession으로 변환하고 React Query cache에 저장한다.
5. AuthProvider가 그 cache를 읽어 Context를 다시 렌더링한다.

cookie가 없는 보호 경로 요청은 보통 proxy.ts에서 먼저 /login으로 이동한다. proxy를 거치지 않는 클라이언트 전환 등에서도 isAuthQueryEnabled=false → unauthenticated → AuthGuard의 fallback이 남아 있다.

## 4. 로그인 흐름

### OAuth와 cookie 발급

~~~mermaid
sequenceDiagram
  participant User
  participant Login as LoginPageController
  participant BE as Backend AuthController
  participant OAuth as Google / GitHub
  participant App as Next.js app
  participant RQ as React Query

  User->>Login: OAuth 버튼 클릭
  Login->>BE: window.location.assign(/auth/google 또는 /auth/github)
  BE->>OAuth: Passport OAuth 시작
  OAuth-->>BE: /auth/{provider}/callback
  BE->>BE: SignInUseCase 또는 LinkAccountUseCase
  BE->>BE: Set-Cookie(access, refresh)
  BE-->>App: /favorites로 redirect
  App->>RQ: 앱 초기화 후 GET /users/me
  RQ-->>App: current-user cache 저장
~~~

프런트엔드 LoginPageController는 window.location.assign(buildApiUrl(getAuthStartPath(provider)))를 호출한다. 로그인 결과를 받는 React mutation이나 setQueryData 호출은 현재 없다.

백엔드 AuthController.completeOAuthCallback()은 로그인 또는 계정 연결 use case 결과로 setAuthCookies()를 호출하고, OAUTH_SUCCESS_REDIRECT_BASE_URL + /favorites로 redirect한다. 따라서 로그인 성공 뒤의 주된 페이지 이동 책임은 **백엔드 OAuth callback redirect**에 있다. LoginPageController의 authenticated → /favorites 이동은 이미 인증된 사용자가 로그인 페이지를 볼 때의 클라이언트 fallback이다.

백엔드 cookie helper에서 확인한 기본 정책은 다음과 같다.

| cookie | 기본 max-age | 공통 옵션 |
| --- | --- | --- |
| access token | 30분 | httpOnly, path: /, secure 설정/환경 기반, secure일 때 sameSite: none, 그 외 lax, 선택적 domain |
| refresh token | 14일 | 위와 동일 |

로그인 후 AuthContext가 갱신되는 방식은 별도 setter가 아니라, 새 앱 렌더에서 /users/me Query가 성공하고 AuthProvider가 currentUserQuery.data를 Context 값에 투영하는 방식이다.

## 5. 로그아웃 흐름

~~~mermaid
sequenceDiagram
  participant User
  participant Hook as useLogout
  participant Provider as AuthProvider
  participant API as apiClient
  participant BE as Backend /auth/logout
  participant Guard as AuthGuard

  User->>Hook: 로그아웃 버튼 클릭
  Hook->>Provider: await logout()
  Provider->>API: POST /auth/logout (skipAuthRefresh)
  API->>BE: cookie 포함 요청
  BE->>BE: JwtAccessGuard → LogoutUseCase
  BE->>BE: refresh session revoke, auth cookies clear
  BE-->>Provider: success 또는 error
  Provider->>Provider: finally: clearClientSession()
  Provider->>Provider: isAuthQueryEnabled=false, queryClient.clear()
  Provider-->>Hook: Promise 완료
  Hook->>Hook: router.replace(/login)
  Guard-->>Guard: 미인증 상태의 fallback redirect 유지
~~~

구체적인 책임은 다음과 같다.

1. 사이드바는 useLogout().handleLogout을 호출한다. hook은 중복 클릭을 막고 pending 상태를 제공한다.
2. AuthProvider.logout()은 POST /auth/logout을 요청한다. 이 요청은 skipAuthRefresh=true이므로 로그아웃 중 access token refresh를 시도하지 않는다.
3. 백엔드 성공 경로는 JwtAccessGuard 통과 후 sessionId가 있으면 해당 refresh session을, 없으면 account/platform 단위 refresh session을 revoke하고 clearAuthCookies()로 두 cookie를 제거한다.
4. 요청의 성공·실패와 관계없이 Provider의 finally가 clearClientSession()을 실행한다. 이 함수는 Query를 비활성화하고 queryClient.clear()로 **전체 Query cache**를 비운다.
5. useLogout이 명시적으로 /login으로 replace한다. AuthGuard의 redirect는 직접 호출자가 없는 미인증 전이에 대한 fallback이다.

## 6. 세션 만료 흐름

두 경로 모두 최종적으로 AuthProvider.clearClientSession()에 합쳐진다.

~~~mermaid
flowchart TD
  Me["A. current-user Query: GET /users/me"] --> MeStatus{"응답 상태"}
  MeStatus -- "404" --> QueryUnauth["authSessionState: unauthenticated"]
  QueryUnauth --> MeEffect["Provider effect: /auth/logout 최선 시도"]
  MeEffect --> Clear["clearClientSession()<br/>enabled=false + queryClient.clear()"]

  MeStatus -- "401" --> Refresh["apiClient refresh 처리"]
  Resource["B. clip/folder 등 일반 API의 401"] --> Refresh
  Refresh --> Terminal{"refresh 최종 실패<br/>또는 재시도 요청도 401"}
  Terminal --> Expired["auth-session:expired event"]
  Expired --> Subscribe["AuthProvider subscribeToAuthExpired"]
  Subscribe --> Clear

  Clear --> Status["AuthStatus: unauthenticated"]
  Status --> Guard["AuthGuard fallback: /login replace"]
~~~

### A. /users/me 조회 중 인증 실패

- **401**: /users/me도 apiClient를 사용하므로 일반 401 규칙을 먼저 탄다. refresh가 최종 실패하거나 refresh 뒤 재시도한 /users/me가 다시 401이면 auth-session:expired 이벤트가 발생하고 Provider 구독이 클라이언트 세션을 정리한다. 이후 Query에 전달된 401도 authSessionState에서 unauthenticated로 해석될 수 있으므로, Query effect와 event 구독은 같은 정리 함수로 수렴한다.
- **404**: apiClient의 refresh 대상은 401뿐이므로 404는 Query error로 전달된다. 백엔드에서 /users/me의 404는 access token 검증 뒤 user 또는 해당 auth account를 찾지 못했을 때 발생한다. Provider는 이를 미인증으로 해석하고 POST /auth/logout을 최선으로 호출한 뒤 결과와 무관하게 clearClientSession()을 실행한다.
- **그 외 오류**: 408·500·네트워크 오류 등은 error 상태가 되며, AuthGuard가 재시도 UI를 표시한다. 자동으로 미인증 처리하지 않는다.

### B. clip/folder 등 다른 API 호출 중 401과 refresh 실패

apiClient는 /auth/refresh, /auth/logout을 제외한 모든 요청에서 첫 401을 처리한다.

1. 동시에 여러 요청이 401을 받아도 refreshPromise 하나로 POST /auth/refresh를 공유한다.
2. refresh는 네트워크 오류 또는 408/429/5xx에 한해 300ms, 800ms 대기 후 재시도한다.
3. refresh가 최종 실패하면 이벤트를 발생시킨다.
4. refresh가 성공했더라도 원 요청을 한 번만 재시도하며, 그 요청이 다시 401이면 이벤트를 발생시킨다.
5. AuthProvider는 이벤트를 받아 Query cache와 client auth lifecycle을 정리한다. 보호 화면의 AuthGuard가 이후 routing을 결정한다.

백엔드 refresh endpoint는 refresh cookie(또는 bearer token)를 JwtRefreshGuard로 검증한 후, 저장된 refresh session의 유효성·token hash를 확인한다. refresh token 만료가 24시간 이하로 남았으면 access·refresh token을 함께 회전하고, 그렇지 않으면 access token cookie만 갱신한다.

## 7. React Query의 역할과 갱신 전략

현재 사용자 정보는 AuthProvider의 useState가 아니라 React Query에서 관리한다. /users/me은 서버가 소유하는 사용자 정보이므로, cache data가 그 요청 결과의 단일 원천이다.

| 항목 | 현재 구조 |
| --- | --- |
| 현재 사용자 data | useCurrentUserQuery의 data |
| cache key | [auth, current-user] |
| Query 재시도 | retry: false; refresh 재시도는 Query가 아니라 apiClient가 담당 |
| 전역 freshness | QueryProvider의 staleTime: 30,000ms |
| focus 동기화 | refetchOnWindowFocus: false |
| 수동 세션 확인 | restoreSession()의 queryClient.fetchQuery(currentUserQueryOptions()) |
| 인증 종료 | queryClient.clear() |

AuthContext.user는 currentUserQuery.data?.user ?? null의 투영 값이다. 따라서 사용자 data가 Query cache와 Context state에 이중 저장되지 않는다. Context는 여러 feature가 Query 세부 상태를 몰라도 되게 하는 인증 UI 계약이다.

현재 코드에서의 갱신 API 의미는 다음과 같다.

| API | 현재 사용 여부 | 이 구조에서의 의미 |
| --- | --- | --- |
| fetchQuery | 사용 | restoreSession()의 공통 재시도 진입점이다. 같은 query option을 사용하며, React Query freshness 정책에 따라 fresh cache를 재사용할 수 있다. |
| invalidateQueries | 미사용 | current-user를 stale로 표시하고 관찰 중인 Query의 다음 재조회 흐름을 유도하는 선택지다. 프로필 변경 뒤 서버 기준 재동기화가 필요할 때 검토할 수 있다. |
| setQueryData | 미사용 | 로그인 성공 직후 local 응답으로 즉시 cache를 채우는 방식이다. 현재 OAuth는 백엔드 redirect 뒤 /users/me로 재확인하므로 사용하지 않는다. |
| hook의 refetch | 미노출·미사용 | 현재는 restoreSession()이 재시도 API다. |

## 8. AuthProvider의 책임

| 담당 | 담당하지 않음 |
| --- | --- |
| shouldRestoreSession을 초기값으로 한 Query enable lifecycle | 페이지 routing과 next/navigation 사용 |
| Query 결과를 AuthStatus·Context 값으로 해석 | 서버의 JWT 검증·리소스 인가 |
| restoreSession()으로 현재 사용자 Query 재시도 | 실제 cookie를 브라우저에서 직접 삭제 |
| logout()의 서버 요청과 finally 기반 로컬 정리 | user 데이터를 별도 React state로 복제 |
| auth-session:expired 이벤트 구독 | AuthGuard의 오류/로딩 화면 렌더링 |
| clearClientSession()으로 Query cache 정리 | 토스트 등 화면별 UX 결정 |

clearClientSession()은 현재 다음 두 작업을 하나의 명명된 책임으로 묶는다.

~~~ts
setIsAuthQueryEnabled(false);
queryClient.clear();
~~~

이 함수는 명시적 로그아웃, /users/me의 미인증 결과, apiClient의 만료 이벤트에서 공통으로 사용된다.

## 9. AuthGuard의 책임

AuthGuard는 app/(protected)/layout.tsx에서 보호 경로를 감싼다.

| AuthStatus | AuthGuard 처리 |
| --- | --- |
| authenticated | children 렌더링 |
| unauthenticated | effect에서 router.replace(/login); effect 실행 전에는 null 렌더링 |
| initializing, idle | 인증 확인 로딩 UI |
| error | 오류 UI, restoreSession() 재시도 버튼, / 이동 버튼 |

Provider가 router를 직접 사용하지 않는 이유는 인증 lifecycle의 상태 정리와 화면 정책을 분리하기 위해서다. 같은 unauthenticated 전이라도 명시적 로그아웃은 useLogout이 즉시 /login으로 이동하고, 보호 경로의 예상 밖 만료는 AuthGuard가 fallback으로 처리한다.

다만 /login 이동 호출이 AuthGuard에만 존재하는 것은 아니다. useFolderClipCapture는 이미 미인증인 사용자의 paste 동작을 막기 위해, useBillingAuthFlow는 결제 흐름에서 받은 401에 대해 각각 router.push(/login)을 호출한다. 이들은 전역 세션 lifecycle이 아니라 feature별 사용자 흐름의 지역 UX 처리다.

proxy.ts도 보호 경로의 빠른 1차 진입 제어를 제공하지만 cookie 존재 여부만 검사한다. 최종 인증·인가는 백엔드와 /users/me 확인에 남는다.

## 10. API Client의 책임

apiClient는 공유 HTTP 인프라이며 React·router·QueryClient를 import하지 않는다.

| 책임 | 구현 |
| --- | --- |
| cookie 전송 | 모든 요청의 기본 credentials: include |
| access 만료 대응 | 일반 API의 첫 401에서 refresh 수행 후 원 요청 한 번 재시도 |
| refresh 동시성 | 모듈 범위 refreshPromise로 동시 refresh 요청 합침 |
| refresh 재시도 | 네트워크/408/429/5xx만 짧게 재시도 |
| 만료 사실 전달 | refresh 최종 실패 또는 재시도 요청의 401에 auth-session:expired 발생 |
| 예외 경로 | /auth/refresh, /auth/logout, skipAuthRefresh 요청은 refresh를 건너뜀 |

API Client가 직접 routing하지 않는 이유는 요청을 보낸 feature·화면의 종류를 알 수 없고, infrastructure가 Next router와 결합될 필요가 없기 때문이다. API Client는 “세션을 더 사용할 수 없다”는 사실만 전달하며, Provider와 Guard가 각각 lifecycle과 UI routing을 처리한다.

백엔드 계약도 이 분리를 뒷받침한다.

- POST /auth/refresh: JwtRefreshGuard와 refresh session 검증을 통과해야 하며, 성공 시 cookie를 갱신한다.
- POST /auth/logout: JwtAccessGuard를 통과한 경우에만 refresh session revoke와 clearAuthCookies()를 수행한다.
- GET /users/me: JwtAccessGuard를 통과한 뒤 현재 user/account를 조회한다.

## 11. 상태 모델

getAuthStatus()는 위에서부터 아래 순서로 조건을 평가한다.

| AuthStatus | 생성 조건 | Context / Guard 의미 |
| --- | --- | --- |
| unauthenticated | isAuthQueryEnabled가 false, 또는 ApiError status가 401/404 | user는 null; 보호 경로를 로그인으로 보냄 |
| initializing | 위 조건이 아니면서 isPending, 또는 isFetching && !session | 초기 확인·재시도 중 로딩 |
| authenticated | 위 조건이 아니면서 session 존재 | session.user를 Context에 제공하고 children 렌더링 |
| error | 위 조건이 아니면서 isError | 재시도 가능한 오류를 Context error로 제공 |
| idle | 위 어떤 조건도 충족하지 않음 | Guard에서는 로딩 UI로 취급 |

따라서 401/404는 isError여도 error보다 먼저 unauthenticated가 된다. 반대로 session이 있는 상태에서 fetch가 진행 중이면 기존 session을 유지하며 authenticated가 된다.

## 12. 폴더 구조

### 프런트엔드

~~~text
src/
├── app/
│   ├── layout.tsx                         # QueryProvider·AuthProvider 조합, 초기 cookie 힌트 전달
│   ├── proxy.ts                           # cookie 존재 여부 기반의 1차 경로 제어
│   ├── (protected)/layout.tsx             # 보호 라우트에 AuthGuard 적용
│   └── (public)/login/_components/
│       └── LoginPageController.tsx        # OAuth 전체 이동과 로그인 페이지 redirect
├── features/auth/                         # 인증 feature와 전역 소비용 공개 API
│   ├── api/authApi.ts                     # auth HTTP endpoint adapter
│   ├── client/
│   │   ├── AuthContext.ts                 # Context 계약
│   │   └── AuthProvider.tsx               # 인증 lifecycle과 Query 해석
│   ├── hooks/
│   │   ├── useAuth.ts                     # Context 접근
│   │   └── useLogout.ts                   # 사용자 의도 로그아웃과 화면 이동 조합
│   ├── model/                             # AuthStatus, 세션 DTO, cookie 이름 계약
│   ├── queries/                           # current-user Query option과 hook
│   ├── server/                            # Next server의 cookie 존재 확인
│   ├── service/                           # Query key, profile 변환, 상태 해석
│   └── ui/                                # AuthGuard와 로그인 UI
└── shared/
    ├── lib/apiClient.ts                   # 공통 cookie HTTP·refresh·만료 이벤트
    └── providers/QueryProvider.tsx        # 앱 전역 QueryClient
~~~

### 백엔드에서 실제로 연결되는 경로

~~~text
easy-clip-be/src/
├── auth/
│   ├── presentation/auth.controller.ts                # OAuth callback, refresh, logout HTTP endpoint
│   ├── presentation/guards/jwt-refresh-token.guard.ts # refresh JWT 추출·검증
│   └── application/usecases/
│       ├── refresh-access-token.usecase.ts            # refresh session 검증·회전
│       └── logout.usecase.ts                          # refresh session 폐기
├── users/
│   └── presentation/users.controller.ts               # GET /users/me
└── shared/
    └── presentation/
        ├── guards/jwt-access.guard.ts                 # access JWT 추출·검증
        └── helpers/auth-cookie.helper.ts              # cookie 설정·제거와 OAuth redirect URL
~~~

## 13. 현재 코드에서 확인되는 설계 원칙

- **Server State는 React Query에서 관리한다.** 현재 사용자는 /users/me Query cache가 단일 원천이다.
- **인증 lifecycle은 AuthProvider가 관리한다.** Query enable, 상태 해석, 명시적 logout, 만료 이벤트 구독, cache 정리가 여기에 있다.
- **보호 경로 routing policy는 AuthGuard에 둔다.** Provider는 router를 알지 않으며, 명시적 로그아웃의 즉시 이동은 useLogout이 조합한다.
- **API Client는 인증 만료 사실만 전달한다.** refresh·재시도 후 event를 발생시키되 직접 Context·Query·router를 조작하지 않는다.
- **서버 인가와 클라이언트 Guard는 별도 책임이다.** 백엔드 guard가 실제 JWT와 리소스 접근을 판정하고, 프런트엔드 Guard는 UX와 경로 전환을 다룬다.
- **인증 종료 시 Query cache를 정리한다.** 다음 사용자에게 이전 사용자 데이터가 남지 않게 한다.
- **cookie 존재와 유효성을 분리한다.** Next proxy와 server helper는 빠른 힌트만 제공하고, 실제 검증은 API 요청으로 한다.

## 14. 현재 선택의 trade-off / 향후 검토 사항

아래는 현재 코드가 잘못됐다는 단정이 아니라, 요구가 커질 때 선택을 재검토할 지점이다.

| 항목 | 현재 선택과 trade-off | 향후 확인/검토 |
| --- | --- | --- |
| 전체 cache 제거 | queryClient.clear()는 사용자 전환 시 데이터 잔존을 확실히 막지만, 공개 데이터와 UI cache까지 초기화한다. | 공개/사용자별 query를 분리해야 하면 auth key 중심 제거 또는 유지 정책을 정의한다. |
| 401/404 세션 계약 | /users/me의 401과 404를 모두 미인증으로 본다. 백엔드 404는 현재 user 또는 auth account 부재를 뜻한다. | API 계약이 넓어질 때 404를 계속 세션 종료로 취급할지 명시한다. |
| restoreSession 전략 | 동일 query option의 fetchQuery를 사용한다. 30초 fresh cache가 있으면 네트워크를 강제하지 않을 수 있다. | “재시도”가 반드시 서버 재검증이어야 하면 invalidate/refetch 또는 stale 정책을 별도로 선택한다. |
| Context value reference | 현재 Provider는 Context value와 restoreSession/logout 함수를 매 렌더 생성한다. 단순성을 택한 구조다. | 소비자 수·렌더 비용이 실제 문제가 될 때만 reference 안정화의 이득을 측정한다. |
| 로그아웃 실패 시 HTTP-only cookie | /auth/logout은 access guard가 필요하고 프런트 요청은 refresh를 건너뛴다. access token이 이미 무효면 Provider는 로컬 상태를 정리하지만, 백엔드 cookie 제거 경로는 실행되지 않을 수 있다. | 만료 access token에서도 서버 cookie 제거가 필요한 UX인지, logout endpoint의 인증/정리 계약을 검토한다. |
| cookie 이름·배포 설정 | 프런트엔드는 기본 cookie 이름을 상수로 검사하고, 백엔드는 환경변수로 cookie 이름을 바꿀 수 있다. CORS와 cookie domain도 환경 의존이다. | cookie 이름 override, domain, secure/sameSite, 허용 origin이 프런트 배포와 일치하는지 배포 설정에서 확인한다. |
| 만료 신호의 중첩 | /users/me 401은 API Client event와 Query의 미인증 해석이 같은 clearClientSession에 도달할 수 있다. 현재 정리 작업은 공통 함수로 통일돼 있다. | 정리 부수효과가 늘어나면 중복 호출 관찰·보호 정책이 필요한지 검토한다. |
| routing의 지역 예외 | 전역 보호 경로 fallback은 AuthGuard지만, 일부 feature가 자기 사용자 흐름에서 /login으로 직접 이동한다. | 모든 로그인 이동을 하나의 정책으로 통일할 요구가 생기면 feature별 예외의 UX 의도를 먼저 정리한다. |
