# 라우팅과 URL 조건 계약 제안

[전체 목록](README.md) · 기준: `dev/e8b47e2` · 11~13번

## 11. 기본 카테고리와 사용자 폴더 URL

**현재:** 기본 카테고리는 `/favorites`, `/recent`, `/trash`이며 폴더는 `/folder/[id]`다. `folder/service/folderRoute.ts`가 폴더 경로를 생성하고 워크스페이스의 경로·사이드바 코드가 pathname을 해석한다.

**권고 초안:** 랜딩 `/`를 유지하면서 목록의 기준 경로를 `/clips`로 모은다. 사용자가 요청한 `?folder=...`는 `/clips?folder=ID`로 적용한다. Query String의 카테고리와 폴더는 상호 배타적 선택자로 정의한다.

| 의미 | 현재 | 제안 URL |
| --- | --- | --- |
| 랜딩 | `/` | `/` |
| 로그인 | `/login` | `/login` |
| 요금제 | `/pricing` | `/pricing` |
| 즐겨찾기 | `/favorites` | `/clips?category=favorites` |
| 최근 항목 | `/recent` | `/clips?category=recent` |
| 휴지통 | `/trash` | `/clips?category=trash` |
| 사용자 폴더 | `/folder/abc` | `/clips?folder=abc` |
| 폴더의 텍스트 검색 | 로컬 상태 | `/clips?folder=abc&type=text&q=회의` |

`/clips`만 입력하면 현재 기본 진입 동작에 맞춰 즐겨찾기로 정규화하는 안을 권고한다. 휴지통 URL을 통일해도 기존 trash feature·API·복원/영구 삭제 책임은 유지한다. 기본 카테고리의 의미를 폴더 ID와 섞지 않는다.

대안은 `/favorites`·`/recent`·`/trash`를 유지하고 사용자 폴더만 `/clips?folder=...`로 바꾸는 것이다. 변경 폭은 작지만 목록 선택이 path/query에 분산된다. 12번까지 함께 해결한다는 요청에는 단일 목록 경로를 권고한다. 최종 경로는 구현 전 확정한다.

전환 순서: URL parser/serializer와 테스트 → `/clips` 조합 페이지 → sidebar 활성 판정과 링크 교체 → 로그인·결제·삭제 후 복귀 경로 교체 → 기존 URL 호환 redirect → 구 링크 회귀 검증. 구 URL redirect는 유효한 검색 조건을 보존하고 경로를 두 번 encode하지 않는다. 전환 안정화 전에는 되돌릴 수 있는 임시 redirect를 사용하고 영구 정책은 이후 확정한다.

완료 기준: 기존 북마크·직접 링크·로그인 복귀가 동작하며 사용자 폴더 ID에 특수문자가 있어도 안전하게 인코딩된다. URL 변환은 브라우저 경로의 변경이며 백엔드 `/clips` 요청 계약을 자동 변경하지 않는다.

## 12. 검색어·카테고리 등 목록 조건을 Query String으로 관리

**현재:** `clip/hooks/useClipCollectionFilter.ts`가 useState로 필터와 검색어를 보유한다. `clip/queries/clipQueryKey.ts`에는 조건이 들어가지만 URL에는 없어 새로고침·공유·뒤로가기로 복원되지 않는다.

| 키 | 허용값·규칙 초안 | 변경 시 동작 |
| --- | --- | --- |
| `category` | favorites / recent / trash | folder 제거, 검색·유형 초기화 |
| `folder` | 비어 있지 않은 ID | category 제거, 검색·유형 초기화 |
| `type` | all / text / color / image, all은 생략 | 같은 범위 유지, cursor 초기화 |
| `q` | 입력 문자열을 URL 인코딩, 조회 시 현재처럼 앞뒤 공백 정리 | 같은 범위 유지, cursor 초기화 |

type의 실제 허용값은 구현 시 `ClipFilter` 및 각 도메인 API와 일치시킨다. 특히 trash는 클립 목록과 다른 조회 계약을 가지므로 지원하지 않는 필터를 그대로 전달하지 않는다. 범위 전환 시 검색을 초기화하는 것은 제품 권고안이며 유지 정책을 선택하면 모든 카테고리에서 동일하게 적용한다.

parser는 category와 folder가 동시에 있으면 유효한 folder를 우선하고 category를 제거한다. 빈 folder, 잘못된 category는 기본 카테고리로 정규화하고 잘못된 type은 all로 처리한다. 중복 키는 첫 값으로 통일한 뒤 serializer로 정리한다. 잘못된 폴더 ID의 존재·권한은 API가 판단하며 정상 폴더로 조용히 바꾸지 않는다.

입력 중 검색 draft만 로컬 상태로 허용하고 debounce 뒤 URL을 replace한다. 명시적인 카테고리·폴더 변경은 push한다. 뒤로가기·앞으로가기 시 URL로 draft도 동기화하고 대기 중인 debounce가 복원된 URL을 덮지 않게 취소한다. 조건 변경 시 목록 스크롤을 처음으로, 이력 복귀 시 저장 가능한 범위에서 위치를 복원한다. 무한 조회 cursor, 선택 체크박스, 열린 모달은 URL에 넣지 않는다.

정규화된 조건 한 벌을 화면·Query Key·API DTO 변환에 사용한다. 서버 페이지 초기 해석과 클라이언트 parser가 다른 기본값을 쓰지 않게 공통 순수 모듈을 둔다. `useSearchParams`는 클라이언트에서 URL 읽기에 사용하고 필요한 정적 렌더링 경계의 Suspense 여부를 확인한다. 이는 [Next.js 공식 문서](https://nextjs.org/docs/app/api-reference/functions/use-search-params)에 근거하며 URL 키 이름과 history 정책은 프로젝트 제안이다.

검색어가 URL에 포함되므로 주소 공유 시 검색어도 공유된다는 UX를 고려한다. 분석 로그에는 검색어 원문을 불필요하게 수집하지 않는다. 인증 후 복귀 URL은 외부 URL을 허용하지 않고 내부 허용 경로만 받는다.

완료 기준: 직접 진입·새로고침·복사 링크·뒤로가기·앞으로가기에서 같은 목록 조건이 복원된다. 한글·공백·&·중복 키·잘못된 값, 빠른 입력 중 뒤로가기, 카테고리 전환, 휴지통 조회를 테스트한다. 서로 다른 조건의 캐시가 섞이지 않아야 한다.

## 13. public/protected 그룹과 AuthGuard

**현재: 구현됨.** `(public)`에 랜딩·로그인·요금제, `(protected)`에 워크스페이스·billing이 있다. `app/(protected)/layout.tsx`만 AuthGuard로 감싼다. 루트 AuthProvider는 세션 공급자이므로 이를 곧바로 모든 페이지를 막는 guard로 보지 않는다.

구조를 다시 만드는 대신 새 `/clips`를 protected 안에 배치하고 공개 요금제 접근을 유지한다. proxy는 쿠키 존재로 빠르게 진입을 분기하고 실제 세션은 AuthGuard·서버 API가 검증한다. 쿠키가 있다는 이유만으로 권한이 유효하다고 취급하지 않는다.

회귀 기준: 비로그인 `/`, `/login`, `/pricing` 허용; `/clips`, `/billing` 인증 요구; 만료 쿠키의 로그인 복구; 세션 검증 실패 시 재시도; 오타 URL의 404. 공통 RootLayout과 Provider를 유지해 불필요한 재마운트를 피하고 설정 초기화는 [6번](01-bugs.md)과 검증한다.
