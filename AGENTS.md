# Repository Agent Rules

## 공통 규칙

- 사용자 응답과 GitHub 이슈·커밋·PR의 제목 및 본문은 한국어로 작성한다.
- 작업 전 현재 저장소 상태와 실제 파일 구조를 확인하고 사용자의 기존 변경을 보존한다.
- 비밀 값은 `.env.local`에서만 관리하고 커밋하지 않는다. 클라이언트에는 공개 가능한 `NEXT_PUBLIC_` 값만 노출한다.
- npm과 `package-lock.json`을 사용하며 존재하지 않는 스크립트를 실행한 것으로 기록하지 않는다.

## 스킬 선택

- 코드 추가·수정, 리팩터링, 구조 변경, 테스트 작성 또는 코드 리뷰에는 `.codex/skills/architecture-guidelines/SKILL.md`를 읽고 적용한다.
- 이슈, 브랜치, 커밋, push, PR, 병합, 이력 재작성 또는 브랜치 정리에는 `.codex/skills/git-workflow/SKILL.md`를 읽고 적용한다.
- 코드 변경을 GitHub에 게시하는 등 두 영역에 걸친 작업에는 두 스킬을 모두 적용한다.
- 더 구체적인 하위 `AGENTS.md`가 있으면 해당 범위에서는 하위 규칙을 우선한다.

## MCP 선택

- 저장소의 코드, 설정과 Git 상태는 먼저 로컬 파일과 명령으로 확인하고 외부 정보가 필요할 때만 MCP를 사용한다.
- Toss Payments 연동 방식, 결제 API와 SDK 계약은 `tosspayments-integration-guide`를 우선 사용한다.
- 프레임워크·라이브러리의 최신 공식 문서와 API 확인은 `context7`을 사용한다.
- 실제 브라우저 렌더링, 사용자 흐름, DOM, 콘솔과 네트워크 분석은 `chrome-devtools`를 사용한다.
- 여러 MCP가 적용되면 도메인 전용 MCP, 공식 문서 조회, 실행 환경 검증 순서로 선택하고 목적과 무관한 MCP는 호출하지 않는다.
- 비밀 값, 인증 정보와 불필요한 사용자 데이터를 MCP 입력에 포함하지 않는다.
