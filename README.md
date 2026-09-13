# Easy Clip 프론트엔드

텍스트·색상·이미지 클립을 저장하고 폴더·태그로 정리하는 Next.js 웹 앱입니다.

## 로컬 실행

Node.js 24와 npm을 사용합니다. 의존성은 `package-lock.json` 기준으로 설치합니다.

```bash
npm ci
npm run dev -- --port 3001
```

FE는 `http://localhost:3001`에서 엽니다. BE는 별도 저장소에서 실행합니다. `.env.local`에 실제 BE 주소를 설정하세요.

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

이 값은 브라우저 번들에 포함되는 공개 API 주소입니다. 비밀 키를 `NEXT_PUBLIC_` 변수에 넣지 않습니다. 비밀 값은 `.env.local`에서만 관리하고 커밋하지 않습니다. 배포 빌드에는 배포 환경의 공개 API 주소를 제공합니다.

## 인증과 구조

웹 인증은 HttpOnly 쿠키와 `credentials: include` 요청을 사용합니다. FE가 토큰을 읽거나 Bearer 토큰을 브라우저 저장소에 보관하지 않습니다. BE의 쿠키·CORS 설정은 사용하는 FE 출처와 맞아야 합니다.

- `src/app`: 라우트·레이아웃·기능 조합
- `src/features`: 기능별 API, query, mutation, UI
- `src/shared`: 공통 UI·설정·기반 코드
- `src/messages`: 한국어·영어·일본어·중국어 메시지

구조 규칙은 [아키텍처 스킬](.codex/skills/architecture-guidelines/SKILL.md)에 있습니다.

## 검증

```bash
npm run lint
npm run typecheck
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3108 npm run build
npm run test
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3108 CI=true npm run test:e2e
npm run build-storybook
```

`build`는 Webpack 프로덕션 빌드입니다. E2E는 FE 서버 3107과 모의 API 주소 3108을 사용하며 실제 로그인·결제를 수행하지 않습니다. Chromium이 없다면 `npx playwright install chromium`으로 설치합니다. 빌드한 앱은 `npm run start -- --port 3001`, 컴포넌트 개발 환경은 `npm run storybook`으로 실행합니다.

## 현재 작업 문서

- [프로젝트 검수·개선 결과](docs/project-review/README.md)
- [이용약관·개인정보 처리방침 초안](docs/legal/README.md)
- [구독·폴더 잠금 계약](docs/frontend-subscription-plan-and-folder-locking-guide.md)
- [태그 API 계약](docs/frontend-tag-api-integration-guide.md)
- [과거 개선 검수](docs/improvement-review/README.md): 당시 제안과 결과를 보존한 기록

서버 API 명세는 [Swagger](https://api.easy-clip.app/docs)에서 확인할 수 있습니다. 운영 배포 여부와 현재 로컬 코드의 일치는 별도 검증 대상입니다.
