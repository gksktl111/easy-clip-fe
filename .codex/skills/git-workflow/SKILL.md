---
name: git-workflow
description: Easy Clip 저장소의 Git/GitHub 운영 절차를 적용한다. 이슈 분류·생성, 브랜치 생성·전환·정리, 커밋, push, PR 생성·수정·검토·병합, dev-main 승격, 커밋 이력 확인·재작성 또는 위험한 Git 작업을 수행할 때 사용한다.
---

# Git/GitHub 워크플로

## 공통 원칙

- 사용자 응답과 이슈·커밋·PR의 제목과 본문을 한국어로 작성한다.
- GitHub 쓰기 작업 전 저장소, 대상 번호, base/head 브랜치와 현재 상태를 확인한다.
- 사용자의 기존 변경을 되돌리거나 관련 없는 파일을 stage하지 않는다.
- 이슈 없이 작업을 시작하지 않는다. 예외가 필요하면 사용자와 먼저 범위를 합의한다.
- GitHub CLI `gh`를 사용할 수 있으며 쓰기 후 원격 상태를 다시 조회한다.

## 제목 형식

커밋과 PR 제목은 다음 형식을 사용한다.

```text
#<관련-이슈> / type(scope) : 한국어 메시지
```

예시:

```text
#97 / refactor(config) : 저장소 지침을 로컬 스킬로 분리
```

- `#<관련-이슈>`는 실제 GitHub 이슈 번호를 사용한다.
- PR 제목의 이슈 번호는 식별과 검색 용도다. 실제 연결은 PR 본문의 `Closes #97` 또는 `Refs #97`로 처리한다.
- squash merge 직전에 최종 커밋 제목도 같은 형식인지 확인한다. GitHub 기본 제목이나 `(#PR번호)`가 규칙을 깨면 수정한다.
- 메시지는 변경 결과를 구체적으로 표현하고 `수정`, `정리`, `추가`, `분리`, `적용` 같은 간결한 한국어 서술을 사용한다.

## 허용 Type

- `feat`: 새로운 사용자 기능이나 흐름
- `fix`: 버그 수정
- `refactor`: 동작 변경 없는 구조·성능 개선
- `docs`: 문서와 지침 변경
- `style`: 동작 변경 없는 표현·포맷 변경
- `chore`: 의존성, 설정, 빌드와 저장소 운영 변경
- `hotfix`: 정상 흐름을 우회해야 하는 긴급 수정
- `release`: 버전, 태그와 배포 릴리스

## 허용 Scope

- 기능: `auth`, `clips`, `favorites`, `recent`, `folder`, `settings`, `subscription`, `trash`, `landing`, `pricing`
- 화면·탐색: `sidebar`, `filter`, `search`
- 공통 UI: `ui`, `css`, `storybook`
- 공통·설정: `shared`, `api`, `config`, `i18n`, `deps`, `ci`
- 여러 영역을 바꿔도 대표 책임 하나를 선택한다. 맞는 scope가 없으면 임의로 재사용하지 말고 이 목록을 먼저 갱신한다.

## 이슈 생성

1. 요청을 bug, feature, improvement 중 하나로 분류한다.
2. `.github/ISSUE_TEMPLATE`의 실제 필드명을 읽는다.
3. 제목 prefix를 `[bug]`, `[feature]`, `[improvement]` 중 하나로 지정한다.
4. 필수 필드를 구체적인 한국어로 채운다.
5. 별도 본문 파일을 만들지 않고 `gh issue create --title ... --body ...`로 생성한다.
6. label을 명시적으로 추가하지 않는다.
7. 생성된 이슈 번호와 URL을 보고한다.

분류 기준:

- bug: 기능 오작동, 오류, 재현 가능한 예상 밖 동작
- feature: 새 기능, 페이지, 사용자 흐름과 상호작용 추가
- improvement: 기존 UX·성능·구조·코드 품질 개선

## 브랜치 생성

1. `git status --short --branch`와 원격 상태를 확인한다.
2. `dev`를 `git pull --ff-only`로 최신화한다.
3. `<type>/<issue-number>` 형식으로 분기한다.

```bash
git switch dev
git pull --ff-only
git switch -c refactor/97
```

- 공유 `dev`에 직접 커밋하지 않는다.
- 로컬과 원격 `dev`가 갈라졌을 때 일반 `git pull`로 merge commit을 만들지 않는다.
- feature 브랜치가 `dev`를 따라가야 하면 미공유 로컬 커밋은 `git rebase origin/dev`, 공유 브랜치는 영향 확인 후 merge/rebase 방식을 합의한다.

## 커밋과 Push

1. `git diff`, `git diff --cached`, `git status`로 범위를 확인한다.
2. 관련 파일만 명시적으로 stage한다.
3. 검증 결과를 확인한다.
4. 제목 형식에 맞춰 커밋한다.
5. 커밋과 원격 대상 브랜치를 확인한 뒤 push한다.

```bash
git add AGENTS.md .codex/skills
git commit -m "#97 / refactor(config) : 저장소 지침을 로컬 스킬로 분리"
git push -u origin refactor/97
```

## PR 생성

1. base를 기본적으로 `dev`로 지정한다.
2. `.github/PULL_REQUEST_TEMPLATE.md` 구조를 유지한다.
3. 요약, 구체적인 변경 사항, 변경 이유와 `Closes #<issue>`를 작성한다.
4. 실행한 검증과 실행하지 못한 검증 이유를 `검증 결과`에 추가한다.
5. 렌더러/UI 변경은 Before/After 스크린샷이나 화면 기록을 추가한다.
6. PR 생성 후 제목, base/head, 본문과 URL을 재조회한다.

```bash
gh pr create --base dev --title "#97 / refactor(config) : 저장소 지침을 로컬 스킬로 분리" --body "..."
```

현재 검증 명령:

- `npm run lint`
- `npm run build`
- build 후 필요 시 `npm run start`
- 공통 UI/story 변경 시 `npm run build-storybook`

존재하지 않는 `npm run package`, `npm run test:e2e`, `npm run typecheck`를 실행 결과에 포함하지 않는다.

## 리뷰와 병합

- 리뷰 의견, CI 상태와 merge 가능 상태를 확인한다.
- squash merge를 기본으로 사용하고 최종 커밋 제목을 규칙에 맞춘다.
- merge commit이 필요한 예외는 보존할 고유 결과와 부모 관계를 먼저 확인한다.
- 병합 후 원격 branch tip과 대상 브랜치 로그를 확인한다.
- `dev -> main` 승격 PR은 누적 변경, 검증 결과와 포함 이슈를 명시한다. 단일 이슈로 오인되는 제목을 사용하지 않는다.

## 브랜치 정리

사용자가 `브랜치 정리해줘`라고 요청하면 다음 순서로 수행한다.

```bash
git switch dev
git fetch --prune origin
git pull --ff-only
git branch -vv
```

- `[gone]` 로컬 브랜치 목록을 먼저 보여주고 현재 브랜치와 미병합 작업을 확인한다.
- 확인된 `[gone]` 브랜치만 삭제한다.
- 원격 브랜치 대량 삭제는 별도 위험 작업으로 취급한다.

## 위험 작업

다음 작업은 대상과 영향을 설명하고 사용자의 명시적 요청을 확인한 뒤 수행한다.

- force push와 history rewrite
- `git reset --hard`, rebase, commit drop
- 로컬·원격 브랜치 대량 삭제
- 공유 브랜치의 merge topology 변경

History rewrite 절차:

1. 작업 트리가 깨끗한지 확인한다.
2. 원격 tip을 fetch하고 예상 old hash를 고정한다.
3. 필요하면 원격 백업 ref를 만든다.
4. 임시 clone에서 재작성한다.
5. 재작성 전후 최종 tree, 커밋 수, merge 수와 대상 메시지를 비교한다.
6. `--force-with-lease=<ref>:<old-hash>`로 갱신한다.
7. 원격을 재조회하고 로컬 브랜치를 새 이력에 맞춘다.
8. 사용자가 삭제를 요청한 백업만 제거한다.

## 후속 자동화

- PR 제목 정규식 검증이 필요하면 GitHub Actions에서 제목 형식을 검사한다.
- branch protection으로 `dev`와 `main` 직접 push를 제한한다.
- 저장소 설정에서 허용할 merge 방식을 정하고 squash 최종 제목 확인 절차를 문서화한다.
- 자동화 도입은 별도 이슈로 추적하고 이 스킬의 형식과 동기화한다.
