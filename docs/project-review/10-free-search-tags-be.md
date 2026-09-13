# 무료 플랜 검색·태그 제한 · BE 전달용

2026-09-14 · **BE 담당자의 로컬 구현·회귀 검증 완료 보고를 수신했다. 커밋·push·배포와 실제 FE 연동은 미완료다. 이 FE 작업에서 BE 코드는 수정하지 않았다.** FE 범위는 [09 문서](09-free-search-tags-fe.md)를 참고한다. 기존 저장소 지침과 사용자 변경을 보존한다.

FE 후속 상태: BE 작업 완료를 전제로 UI·조회·저장 제한과 기존 태그 읽기 전용 표시를 구현했다. FE mock 검증 결과는 [09 문서](09-free-search-tags-fe.md)에 기록했다. 실제 BE 차단·배포 완료는 별도 확인이 필요하다.

## BE 확정 계약 · 2026-09-14 수신

관련 BE 이슈 #161, `feat/161`. 다음은 사용자가 전달한 완료 보고 기준이며 이 FE 작업에서 BE 테스트를 직접 실행한 기록은 아니다.

- 유효 Pro는 `plan=PRO`, `status=ACTIVE|CANCELED`, 현재보다 미래인 `currentPeriodEnd`를 모두 만족해야 한다. 기존 구독 응답에 capability·effectivePlan 필드는 추가하지 않는다.
- `GET /clips`의 기본·folderId·favorite·recent 범위에서 정규화 후 비어 있지 않은 `q`는 Pro 전용이다. q 누락·빈 값·공백은 일반 목록이다. FE는 검색 해제 시 q와 커서를 초기화한다. `GET /clips/views/recent`에는 검색 인자를 추가하지 않는다.
- `GET/POST /folders/:folderId/tags`, `PATCH/DELETE /folders/:folderId/tags/:tagId`, `PUT /clips/:clipId/tags`는 Pro 전용이다. 빈 배열·기존 이름·새 이름·변경 없는 PATCH도 Free에서 거부한다.
- 오류는 기존 Nest 형식의 `403 FEATURE_NOT_AVAILABLE`. 검색 message는 “클립 검색은 Pro에서 사용할 수 있습니다.”, 태그는 “태그 관리는 Pro에서 사용할 수 있습니다.”이나 FE 분기 키로 사용하지 않는다. 새 details·기능 식별 필드를 추가하지 않으며 기존 클립 한도의 details는 유지한다.
- 대상 소유권·존재·활성 상태의 404, 폴더 잠금의 `403 PROJECT_LOCKED`, 기능 제한의 `403 FEATURE_NOT_AVAILABLE` 순서를 유지한다. 접근 폴더의 없는 태그도 기능 제한보다 먼저 404다. 인증·입력 오류는 기존 처리를 유지한다.
- 일반 클립 응답의 기존 tags와 일반 수정 시 연결을 보존한다. FE는 기존 배지를 읽기 전용으로 표시하고 일반 저장에서 태그 PUT을 자동 호출하지 않는다.
- 서버는 잠금 획득 후 유효 권한을 재검사하고 태그 옵션·연결 쓰기 전에 거부한다. 이번 제한 자체에는 새 마이그레이션·환경변수·삭제·백필이 없다. 기존 P1 배포 요건은 별개다.

### BE 담당자 보고 검증

`pnpm test --runInBand`: 56 suites / 308 tests. 전체 E2E: 10 suites / 120 tests. 전체 실행 후 추가 사례를 포함한 검색·태그 보강 14개는 별도 실행으로 검증했다(요청 사전 생성으로 연결이 닫힌 테스트를 순차 생성으로 수정 후 해당 사례 통과). 린트·타입 검사·빌드도 통과했다고 보고했다. 최종 추가 사례까지 전체를 한 번에 재실행한 수치로 합산하지 않는다.

격리 PostgreSQL 16과 로컬 Nest HTTP에서 JWT 쿠키·Origin·CSRF를 사용했고, 거부 전후 Tag/ClipTag 동일성·잠금 대기 중 만료·부분 쓰기 없음 등을 확인했다고 보고했다. 실제 FE 통합·운영 버전·배포 후 인수는 미실행이다.

### 남은 전환 작업

- FE/BE 커밋·push·배포는 이번 보고로 승인되지 않았다.
- 기존 사용자 적용 조건·고지·시행일·배포 일정을 확정하고, 승인된 환경에서 Free 일반 목록/유료 기능 차단·Pro 검색 fallback·해지 잔여 기간·만료·데이터 보존을 확인한다.
- 판매 가격·환불 및 가격 변경 정책은 이번 검색·태그 계약에서 확정하지 않았다.

## 최초 조사와 요청 당시 상태

사용자가 Free 계정에서 검색·태그 관리 UI를 보고 태그 생성도 가능하다고 보고했다. 요청 기준은 검색·태그 관리를 Pro 전용으로 전환하는 것이다.

조사 결과 기존 정책은 Free의 접근 폴더에서 검색·태그를 허용한다. `docs/clip-plan-limits.md`는 별도 태그 유료화를 제외하고, `docs/subscription-plan-limits-and-folder-locking.md` 및 FE 플랜 명세도 같은 정책을 따른다. 단순히 빠진 검사를 보충하는 작업이 아니라 **기존 공개 정책과 테스트를 함께 바꾸는 기능 제한 변경**이다.

로컬 코드에서 확인한 근거:

| BE 파일 | 현재 동작 |
| --- | --- |
| `src/clips/presentation/clips.controller.ts` | `GET /clips`가 folderId/favorite/recent 분기로 q를 전달. 인증은 검사하지만 검색 전용 Pro 조건은 없음 |
| `src/clips/application/usecases/list-clips.helper.ts` | 제목 매칭 여부 조회 후 태그 매칭으로 대체하는 검색 경로가 있어 최종 목록 쿼리 이전에도 검색이 실행됨 |
| `src/clips/infrastructure/prisma-clips.repository.ts` | 목록·검색에 폴더 접근 범위를 적용하지만 Free 검색 자체는 허용 |
| `src/folders/application/usecases/create-folder-tag.usecase.ts` | 소유 폴더 조회·이름·색상·중복 검사 후 태그 생성 |
| `src/folders/infrastructure/prisma-folders.repository.ts` | create/update/delete 태그에서 `withFolderAccess` 사용. 폴더 순서 변경에는 별도의 effectivePlan 검사와 `FEATURE_NOT_AVAILABLE`가 있으나 태그에는 없음 |
| `src/clips/infrastructure/prisma-clips.repository.ts`의 `replaceClipTags` | `withClipAccess` 안에서 이름별 태그 upsert 후 연결을 전체 교체. 태그 생성 API만 막으면 이 경로로 새 태그가 생김 |
| `src/shared/application/folder-access.ts`, `src/shared/infrastructure/prisma-folder-access.ts` | 소유권·접근 폴더·잠금 및 트랜잭션 보호가 있음. 접근 가능한 Free 폴더에는 검색/태그 사용을 허용 |

**운영 서버에 직접 생성 요청을 보내거나 실제 사용자 인증 응답을 검증하지는 않았다.** FE mock E2E도 기존 Free 허용을 정상으로 검증한다. BE 인수 시 현재 배포 버전과 실제 실행 컨테이너가 이 코드와 일치하는지 별도로 확인한다.

## 목표 계약

| API/기능 | Free 목표 동작 | Pro 목표 동작 |
| --- | --- | --- |
| `GET /clips`의 비어 있지 않은 q: 폴더·즐겨찾기·최근 및 기본 최근 분기 전체 | `403 FEATURE_NOT_AVAILABLE` | 기존 검색 유지 |
| `GET /folders/:folderId/tags` | 관리 목록 조회 차단 | 기존 동작 유지 |
| `POST /folders/:folderId/tags` | 생성 차단 | 기존 동작 유지 |
| `PATCH /folders/:folderId/tags/:tagId` | 이름·색상 수정 차단 | 기존 동작 유지 |
| `DELETE /folders/:folderId/tags/:tagId` | 태그 삭제 차단 | 기존 동작 유지 |
| `PUT /clips/:clipId/tags` | 연결·해제·전체 교체와 암묵적 생성 모두 차단. 빈 배열도 변경 요청으로 처리 | 기존 동작 유지 |
| q가 없는 일반 목록·유형 필터·일반 클립 작업 | 기존 접근 폴더 정책 유지 | 기존 동작 유지 |

q의 빈 문자열·공백만 있는 문자열은 정규화 후 일반 목록으로 취급하는 안을 기준으로 한다. 별도 검색 조건이나 검색 결과 커서로 유료 검색을 우회하지 못해야 한다. 현재 `GET /clips/views/recent`의 별도 조회 계약도 확인해 검색 인자를 지원한다면 같은 규칙을 적용한다. 존재하지 않는 별도 검색 API를 임의로 만들 필요는 없다.

기존 태그와 클립 연결은 삭제하지 않는다. 일반 클립 응답의 태그를 읽기 전용으로 유지하는 안을 권고하며, 태그 배지의 표시 여부는 FE와 확정한다. 관리 API 차단과 기존 데이터의 표시·보존은 별개의 문제다. 이 문서는 데이터 마이그레이션이나 Free 응답의 일괄 `tags: []` 변환을 지시하지 않는다.

## 구현 지침

1. 서버의 실제 유효 플랜 판정을 재사용한다. raw plan 값·클라이언트 주장·오래된 JWT 정보만 신뢰하지 않는다. 해지 예약 후 유료 기간이 남으면 Pro, 기간 만료 후에는 Free로 판정한다.
2. 검색은 제목 존재 확인·태그 fallback·검색 커서 해석을 포함해 검색 작업 전에 기능 권한을 검사한다. 최종 목록 필터만 차단해도 앞선 검색 존재 여부가 노출되거나 불필요한 검색이 실행될 수 있다.
3. 태그 mutation은 기존 소유권·폴더/클립 접근 검사와 잠금 순서를 유지하면서 **실제 쓰기 트랜잭션 안에서** 유효 플랜을 재확인한다. usecase의 사전 검사만으로 요청 대기 중 만료·다운그레이드 경합을 처리했다고 보지 않는다.
4. `replaceClipTags`의 upsert 전에 차단한다. 거부 응답 이후 Tag/ClipTag가 일부 생성·삭제되는 부분 변경이 없어야 한다. 일반 클립 삭제에 따른 연결 정리는 허용하고 태그 전용 제한으로 클립 삭제까지 막지 않는다.
5. 존재하지 않거나 타인 소유인 자원에는 기존 404 정책을 유지하고, 잠긴 폴더에는 기존 `PROJECT_LOCKED` 계약을 유지한다. 기능 제한 검사가 소유권 정보 누출이나 잠금 우회를 만들지 않게 오류 우선순위를 테스트한다.
6. `FEATURE_NOT_AVAILABLE`의 기존 403 구조를 재사용한다. 기능 식별이 필요하면 `details.feature: 'CLIP_SEARCH' | 'TAG_MANAGEMENT'`, `details.requiredPlan: 'PRO'`를 **추가 계약안**으로 FE와 확정한다. 현재 이미 존재하는 응답 필드라고 가정하지 않는다. 사람용 message 문자열로 FE 분기를 요구하지 않는다.
7. 새 권한 필드를 제공해야 한다면 기존 구독 응답 확장 또는 capability 계약을 FE에 공유한다. 신설 API는 기존 계약으로 해결할 수 없는 경우에만 검토한다. 정책 문서·Swagger·요금표 전달 내용도 같은 범위로 갱신한다.

## BE 테스트·인수 조건

- [ ] Free의 접근 가능한 자기 폴더에서도 q 검색, 태그 목록·생성·수정·삭제·연결 전체 교체가 거부됨.
- [ ] `PUT /clips/:clipId/tags`에 새 이름·기존 이름·빈 배열을 보내도 Free는 거부되고 DB 변경이 없음.
- [ ] q의 제목 매칭/태그 fallback, folderId/favorite/recent/기본 분기 및 커서 재사용을 모두 검증.
- [ ] 유효한 Pro·해지 예약 잔여 기간은 정상, 만료·Free 전환 직후는 거부. 쓰기 대기 중 플랜 변경 경합도 검증.
- [ ] 타인 자원·삭제 자원·잠긴 폴더의 기존 접근 보호 유지.
- [ ] Free의 일반 조회·유형 필터·클립 생성/수정/삭제·복사 지원 API·즐겨찾기와 기존 한도 동작 유지.
- [ ] 다운그레이드로 기존 Tag/ClipTag가 삭제되지 않고 Pro 재구독 시 재사용 가능.
- [ ] 실제 HTTP 오류 상태·code·details를 검증. 인증 및 CSRF 검사를 통과한 테스트 요청으로 유료 기능 제한을 검증해 다른 403과 혼동하지 않음.
- [ ] FE에 최종 오류 예시·유효 플랜 기준·기존 태그 읽기 정책·변경 API 목록·적용 순서 전달.

## 적용 순서와 운영 결정

FE 숨김만으로 직접 API 호출을 막을 수 없으므로 BE 제한과 FE 대응을 함께 준비한다. 현재 요금표에는 Free 검색·태그가 포함되어 있어 기존 사용자 적용 범위와 고지 시점을 결정해야 한다. 제안된 오류 details와 읽기 전용 태그 표시 여부는 구현 전 FE와 확정한다. 커밋·push·배포 범위는 별도 작업 지시에 따른다.
