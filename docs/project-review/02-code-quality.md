# 02. 불필요한 코드와 구조 정리

[전체 요약](README.md)

## FE 적용 결과

- 미사용 `IMAGE_CLIP_ACCEPT`, `clearAllPartialError`와 더 이상 표시하지 않는 정책·후기·미제공 혜택 번역을 삭제했습니다. 제외된 후기 배너와 7개 반복 원본도 제거했습니다.
- 폴더·휴지통의 변경 훅을 `mutations`로 옮기고 낙관적 갱신·실패 복원·재조회를 mutation 생명주기로 묶었습니다. 설정 저장도 UI에서 mutation으로 옮겨 기존 번역·값 복원·중복 실행 방지를 유지했습니다.
- 루트 README의 실행·검증·쿠키 인증·환경변수 안내를 갱신하고, 과거 검수 표시와 복사된 서버 코드 링크를 정리했습니다.
- 인위적 지연과 재조회·구독 최적화는 05 커밋에서 처리합니다. 서버 가격 계약은 FE만으로 완료하지 않습니다.

검증: lint·타입 검사·Webpack production build·단위 테스트 120개·E2E 100개를 통과했습니다. 기존 폴더 순서·휴지통·설정 오류 복구와 01 기능 회귀 시나리오를 포함해 확인했습니다.

Ponytail MCP 기준의 구체적인 최적화 후보·적용 순서·측정 기준은 [05 코드 최적화](05-code-optimization.md)에 추가했습니다. 이 문서는 기존 코드 정리 판단을 유지합니다.

**대규모 파일 삭제가 필요한 상태는 아닙니다. 작은 미사용 항목과 중복 정책부터 정리하는 편이 효과적입니다.** App·proxy·i18n에서 정적 import/export 연결을 따라갔을 때 고립된 제품 TS/TSX 파일은 발견하지 못했습니다. 배럴 export에 연결됐다는 사실이 모든 export의 실제 사용을 보증하지는 않습니다.

| 우선순위 | 확인한 문제 | 개선 방법 | 완료 기준 |
| --- | --- | --- | --- |
| P2 | `IMAGE_CLIP_ACCEPT`는 정의 외 사용처가 없고, `clearAllPartialError`는 4개 번역 파일에만 존재 | 전체 참조 재확인 후 삭제. 파일 전체를 함께 지우지는 않음 | 해당 항목 제거 후 lint·타입·관련 테스트 통과 |
| P2 | 7개 후기 데이터 중 여러 항목이 같고, 화면이 다시 2번 복제 | 검증된 고유 후기만 데이터로 유지. 움직이는 배너가 필요하면 표현 단계에서만 복제 | 내용 중복 제거, 보조기술에 중복 후기 노출 없음 |
| P1 | 가격이 상수·제목 설명·결제 카드·서버 기본값에 반복 | F1의 서버 가격 계약으로 단일화 | 가격 변경을 여러 UI 파일에서 반복하지 않음 |
| P2 | 클립 조회 성공·실패 응답을 최소 300ms까지 강제로 지연 | 데이터 응답은 즉시 반영. 깜빡임이 문제면 로딩 표시를 늦게 시작하거나 기존 콘텐츠 유지 | 빠른 API를 고의로 늦추지 않고 오류도 즉시 표시 |
| P2 | 폴더/휴지통의 요청·캐시·알림 책임이 `hooks`에 집중. 설정 UI도 저장을 직접 수행 | 변경 시점에 도메인별 `mutations`로 이동하고 UI 훅은 상태와 이벤트 조합에 집중 | 기존 캐시 갱신·중복 실행 방지·실패 복구 유지 |

근거: [이미지 검증](../../src/features/clip/service/imageClipValidation.ts), [메시지](../../src/messages/ko.json), [랜딩 데이터](../../src/features/landing/const/landingContent.ts), [삭제 전 배너](https://github.com/gksktl111/easy-clip-fe/blob/2a8a16a/src/features/landing/ui/LandingReviewsBanner.tsx), [로딩 지연](../../src/shared/lib/loading.ts), [클립 조회](../../src/features/clip/queries/clipInfiniteQueryOptions.ts), [폴더 액션](../../src/features/folder/mutations/useFolderActions.ts), [휴지통 액션](../../src/features/trash/mutations/useTrashActions.ts), [설정 mutation](../../src/features/settings/mutations/useSettingsMutation.ts).

## 문서도 현재 코드에 맞춰 정리

README의 환경·인증 안내와 이전 검수 문서가 현재 코드와 섞여 있습니다. 특히 구독 연동 가이드에는 Bearer 인증 설명이 있지만 현재 웹은 쿠키 인증을 사용합니다. 복사해 온 서버 가이드의 링크 일부도 FE 내부에 없는 서버 파일을 가리킵니다.

현재 실행 명령·쿠키 인증·환경변수의 공개/비공개 구분을 README에 정리하고, 이전 검수는 날짜와 “과거 기록”을 명시합니다. 과거 제안을 현재 미구현 목록으로 그대로 가져오지 않습니다.

## 유지할 코드

권한 세대 검사, 이전 요청 취소, 정책 오류 후 재확인, 결제 confirm 자동 재전송 방지는 복잡해 보여도 기능·보안상 필요합니다. 이번 테스트에서 관련 경계 동작이 확인됐으므로 단순화 목적으로 제거하면 안 됩니다. Storybook 파일과 테스트도 제품 화면에서 import하지 않는다는 이유만으로 미사용 코드로 분류하지 않았습니다.
