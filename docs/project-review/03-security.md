# 03. 보안 검수

[전체 요약](README.md)

아래는 **로컬 코드에서 확인한 방어 공백과 알려진 취약 버전**입니다. 운영 서비스에 공격을 수행하거나 실제 유출·중복 청구를 확인한 결과는 아닙니다.

## S1 · P0 — Next.js 이미지 최적화 취약 버전

lockfile은 `next 16.1.1`, `sharp 0.34.5`입니다. Next.js 공식 GHSA는 16.3.3 미만의 영향 범위를 명시합니다. 프로젝트는 AVIF 업로드를 허용하고, 허용 CDN 이미지를 `next/image`로 최적화하므로 공격자가 제공한 AVIF를 처리할 수 있는 코드 경로가 있습니다. 실제 운영의 최적화 실행 환경은 추가 확인이 필요합니다.

**개선:** 공식 수정 버전인 16.3.3 이상에서 적용할 안전한 버전을 확인해 Next.js·관련 의존성과 lockfile을 함께 갱신하고 재배포합니다. 즉시 갱신이 어렵다면 서버 이미지 최적화 경로를 차단하는 임시 대응을 검토합니다. 업로드 확장자만 차단하면 기존 CDN 객체 경로가 남습니다.

**완료 기준:** 배포 아티팩트의 패치 확인, 이미지 표시·복사·빌드 회귀 검증. [공식 보안 공지](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4).

근거: [lockfile](../../package-lock.json), [이미지 설정](../../next.config.ts), [클립 이미지 표시](../../src/features/clip/ui/ClipItem.tsx), BE [허용 MIME](https://github.com/gksktl111/easy-clip-be/blob/dev/src/shared/application/helpers/clip-image-mime-type.helper.ts).

## S2 · P1 — 쿠키 인증의 CSRF 방어 누락

운영 기본 쿠키가 `SameSite=None; Secure`이고, CORS는 불허 출처에 응답 허용 헤더를 주지 않는 방식입니다. 상태 변경 요청의 Origin/CSRF 토큰 검사는 찾지 못했습니다. CORS만으로 단순 POST 실행을 막을 수 없으므로, 쿠키를 보내는 브라우저에서는 `/auth/logout` 같은 요청이 외부 사이트에서 유도될 위험이 있습니다. 브라우저의 타사 쿠키 정책·운영 게이트웨이에 따라 실제 노출은 달라집니다.

**개선:** 쿠키 인증 변경 요청에 신뢰 Origin 검증과 CSRF 방어를 적용합니다. Bearer 기반 앱 요청과 OAuth 콜백은 별도 규칙으로 처리하고, Origin 없는 요청을 무조건 허용하지 않습니다.

**완료 기준:** 허용 FE만 변경 요청 성공, 불허 출처의 단순 POST도 403. [OWASP 기준](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

근거: BE [쿠키 설정](https://github.com/gksktl111/easy-clip-be/blob/dev/src/shared/presentation/helpers/auth-cookie.helper.ts), [CORS](https://github.com/gksktl111/easy-clip-be/blob/dev/src/shared/presentation/helpers/cors.helper.ts), [서버 초기화](https://github.com/gksktl111/easy-clip-be/blob/dev/src/main.ts).

## S3 · P1 — OAuth state가 시작 브라우저와 연결되지 않음

state의 서명·만료는 검사하지만, 시작 브라우저에 보관한 난수와 대조하거나 한 번 사용한 state를 폐기하는 처리가 없습니다. 서명이 유효한 다른 로그인 시도의 콜백을 구분하지 못하는 구조로, 로그인 CSRF 위험이 있습니다. 실제 OAuth 제공자를 통한 공격 재현은 하지 않았습니다.

**개선:** 로그인 시도별 난수를 브라우저 세션에 연결하고 콜백에서 대조·일회성 소비합니다. 계정 연결은 시작 사용자와 콜백 세션도 일치시킵니다.

**완료 기준:** 정상 로그인 성공, 다른 브라우저·재사용·만료 state 거부. [OWASP OAuth 기준](https://cheatsheetseries.owasp.org/cheatsheets/OAuth2_Cheat_Sheet.html).

근거: BE [state 처리](https://github.com/gksktl111/easy-clip-be/blob/dev/src/auth/presentation/helpers/oauth-state.helper.ts), [Google 전략](https://github.com/gksktl111/easy-clip-be/blob/dev/src/auth/presentation/strategies/google.strategy.ts), [GitHub 전략](https://github.com/gksktl111/easy-clip-be/blob/dev/src/auth/presentation/strategies/github.strategy.ts).

## S4 · P1 — 예외 로그에 인증 쿼리가 남을 수 있음

일반 HTTP 로그는 URL을 정리하지만, 예외 필터는 `request.originalUrl`을 `path`에 그대로 기록합니다. OAuth 콜백 실패 시 `code/state` 등이 이 경로로 남을 수 있습니다. 현재 pino의 `req.url` 정리는 별도 `path` 필드를 보호하지 않습니다.

**개선:** 예외 로그에는 경로명과 요청 ID만 기록하고 쿼리·오류 객체를 공통 비식별 처리합니다.

**완료 기준:** 가짜 인증 쿼리를 포함한 실패 요청의 최종 로그에 원문이 없음.

근거: BE [예외 필터](https://github.com/gksktl111/easy-clip-be/blob/dev/src/shared/presentation/filters/application-exception.filter.ts), [pino 설정](https://github.com/gksktl111/easy-clip-be/blob/dev/src/shared/infrastructure/pino-logger.config.ts).

## S5 · P1 — 업로드 크기 검사가 메모리 적재 이후에 실행

`FileInterceptor('file')`에 수신 제한이 없고, 전체 파일을 받은 뒤 저장 서비스에서 기본 10MB를 검사합니다. 큰 파일을 동시에 전송하면 저장 거부 전에 메모리를 소모할 수 있습니다. MIME도 클라이언트가 보낸 값만 검사합니다. 운영 프록시의 제한 여부는 미확인입니다.

**개선:** multipart 수신 단계의 파일 크기·개수·파트 수 제한, 사용자별 요청 제한, 실제 파일 형식 검증을 적용합니다. 프록시 제한과 앱 제한을 맞춥니다.

**완료 기준:** 초과 파일을 업로드 초기에 거부하고 제한된 메모리 사용 유지, MIME 위장 파일 거부. [Multer 공식 문서](https://expressjs.com/en/resources/middleware/multer/).

근거: BE [업로드 진입점](https://github.com/gksktl111/easy-clip-be/blob/dev/src/clips/presentation/clips.controller.ts), [저장 서비스](https://github.com/gksktl111/easy-clip-be/blob/dev/src/shared/infrastructure/r2-clip-image-storage.service.ts).

## S6 · P1 — 최초 결제 중복·결과 유실 방어가 서버에서 부족

FE의 제출 기록은 메모리와 탭별 sessionStorage에 있습니다. 서버 confirm은 요청마다 새 주문 ID를 만들며 외부 청구 후 결과를 저장합니다. 따라서 별도 탭·동시 요청, 청구 성공 후 DB 저장 실패까지 FE만으로 막을 수 없습니다. 외부 결제사의 인증 키 재사용 거부 여부와 실제 중복 과금은 이번에 검증하지 않았습니다.

**개선:** 최초 결제 시도를 서버에 먼저 기록하고, 같은 시도는 동일 주문/멱등 식별자로 처리합니다. 처리 중·결과 불명확 상태는 재청구 대신 조회·대사로 복구합니다. 자동갱신에 이미 있는 대사 흐름과 함께 설계합니다.

**완료 기준:** 결제 게이트웨이 대역으로 동시 confirm·응답 유실·DB 실패를 주입해 외부 청구 1회와 결과 복구 확인.

근거: [FE 제출 방지](../../src/features/subscription/service/confirmBillingAuthOnce.ts), BE [최초 결제](https://github.com/gksktl111/easy-clip-be/blob/dev/src/subscriptions/application/usecases/confirm-billing-auth.usecase.ts).

## 추가 운영 판단

이미지는 공개 CDN URL이어서 URL을 이미 아는 사람의 접근을 폴더 잠금으로 회수하지 못합니다. 기존 가이드에도 명시된 정책 한계입니다. 비공개 자료 보관을 목표로 한다면 private 객체와 짧은 유효기간의 인증 URL/프록시가 필요하며, 기존 URL도 별도 전환해야 합니다. API 키 저장을 권하는 현재 후기 문구는 이 보관 정책과 함께 재검토해야 합니다.

이번 FE 검사에서 추적 중인 `.env*` 파일과 `dangerouslySetInnerHTML` 사용은 발견하지 못했습니다. 이것이 전체 이력의 비밀 유출이나 모든 XSS 가능성을 배제하는 것은 아닙니다. 로그아웃 문제는 [F2](01-functionality.md)에도 정리했습니다.
