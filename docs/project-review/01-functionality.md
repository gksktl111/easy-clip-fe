# 01. 기능 완성도

[전체 요약](README.md)

## 구현된 핵심 흐름

| 기능 | 확인 결과 |
| --- | --- |
| 클립 저장·복사·검색·즐겨찾기·이름 변경·태그 | FE/BE 구현과 관련 단위·브라우저 테스트 확인 |
| Free/Pro 폴더 접근과 50/300개 추가 저장 한도 | 잠금, 초과 기존 자료 보존, 잘못된 커서 재시작, 입력 보존 시나리오 통과 |
| 권한 변경 | 만료·계정 변경·늦게 도착한 이전 응답 차단 시나리오 통과 |
| 휴지통 | 선택 복구·영구 삭제·숨겨진 항목을 포함한 전체 비우기 시나리오 통과 |
| 구독 해지·재개·결제 결과 확인 | 화면과 서버 코드 존재, 가짜 API 기반 흐름 통과. 실제 결제 완료 판정은 제외 |
| 설정·반응형·다국어 | 기본 동작 구현. 결제 화면 번역과 모달 접근성은 미완성 |

## 먼저 고칠 사항

### F1 · P1 — 표시 가격과 서버 기본 청구액 불일치

- **문제:** 가격표·결제 화면은 3,900원, 서버 최초 결제·자동갱신 기본값은 4,900원입니다. 운영 `PRO_MONTHLY_AMOUNT`가 무엇인지는 확인하지 않았으므로 실제 오청구가 발생했다고 단정하지 않습니다. 설정을 바꾸면 화면만 이전 가격에 남는 구조 자체가 문제입니다.
- **개선:** 서버가 공개 가격·통화·결제 주기를 제공하고 FE가 이를 표시하게 합니다. 결제 시작 시 같은 가격 버전을 확정하고 최초 결제와 갱신에 함께 적용합니다.
- **완료 기준:** 서버 가격 변경 시 가격표·결제 화면이 함께 바뀌고, 결제 요청 금액과 일치하는 통합 테스트 통과.
- **근거:** [가격 상수](../../src/features/pricing/const/pricingContent.ts), [결제 카드](../../src/features/subscription/ui/BillingCheckoutCard.tsx), BE [최초 청구](https://github.com/gksktl111/easy-clip-be/blob/dev/src/subscriptions/application/usecases/confirm-billing-auth.usecase.ts), [자동갱신](https://github.com/gksktl111/easy-clip-be/blob/dev/src/subscriptions/application/usecases/process-due-auto-renewals.usecase.ts).

### F2 · P1 — 로그아웃 실패를 성공으로 안내

- **문제:** 서버 로그아웃 오류를 삼키고 클라이언트 캐시만 비웁니다. 요청을 실패시킨 브라우저 검수에서 “로그아웃했습니다” 표시 후 새로고침하면 `/favorites`로 복귀했습니다. HttpOnly 쿠키가 남아 세션을 다시 복원하는 흐름입니다.
- **개선:** 서버 세션 종료와 화면 데이터 정리를 구분합니다. 종료 실패는 실패로 알리고 재시도를 제공하며, 쿠키 삭제가 확인되기 전 성공으로 표시하지 않습니다. 이전 화면의 민감한 데이터는 계속 숨깁니다.
- **완료 기준:** 정상·네트워크 실패·서버 오류 각각에서 안내와 재접속 상태가 일치.
- **근거:** [AuthProvider](../../src/features/auth/client/AuthProvider.tsx), [useLogout](../../src/features/auth/hooks/useLogout.ts).

### F3 · P1 — 약관·개인정보 안내가 실제 문서로 연결되지 않음

- **문제:** 로그인 화면의 두 링크가 모두 `href="#"`입니다.
- **개선:** 실제 문서 페이지를 만들거나 승인된 외부 문서에 연결합니다. 내용·버전·적용일은 운영 정책에 맞춰 확정합니다.
- **완료 기준:** 로그인 전에도 두 문서를 읽을 수 있고 뒤로 돌아올 수 있음.
- **근거:** [LoginAgreementNotice](../../src/features/auth/ui/LoginAgreementNotice.tsx).
- **진행 상태:** 사용자 요청으로 [이용약관·개인정보 처리방침 초안](../legal/README.md)을 작성했습니다. 운영자 정보·환불·보유 기간·외부 업체 등은 미확정이며, 공개 및 로그인 연결은 아직 미완료입니다. 초안 자체를 동의 대상으로 연결하지 않습니다.

### F4 · P1 — 상품 설명 일부가 구현 범위를 앞섬

- **문제:** Free의 “데스크톱 1개, 모바일 1개” 제한을 표시하지만, 확인한 로그인·세션 발급 경로에는 플랜별 기기 수 제한이 없습니다. 랜딩 후기는 팀 템플릿 공유를 말하지만 이 FE에는 공유·초대 흐름이 없습니다. AI는 “예정”으로 명시돼 있으므로 현재 기능 누락 결함은 아니지만, 결제 혜택 체크 목록에 섞여 있습니다.
- **개선:** 현재 제공 기능만 상품 혜택에 남깁니다. 기기 제한·팀 공유가 실제 요구사항이라면 별도 기능으로 명세·구현하고, 예정 기능은 현재 혜택과 분리합니다. 후기의 실제 출처·사용 동의도 확인합니다.
- **완료 기준:** 요금표·후기·실제 제공 기능이 일치.
- **근거:** [한국어 상품 문구](../../src/messages/ko.json), [후기 데이터](../../src/features/landing/const/landingContent.ts), BE [로그인](https://github.com/gksktl111/easy-clip-be/blob/dev/src/auth/application/usecases/sign-in.usecase.ts), [세션 발급](https://github.com/gksktl111/easy-clip-be/blob/dev/src/auth/infrastructure/jwt-auth-session.port.ts).

### F5 · P2 — 결제 화면 다국어 미완성

영어 설정에서도 제목·설명·버튼은 한국어, 혜택 목록은 영어로 표시됩니다. [BillingPage](../../src/features/subscription/ui/BillingPage.tsx), [BillingHeroSection](../../src/features/subscription/ui/BillingHeroSection.tsx), [BillingCheckoutCard](../../src/features/subscription/ui/BillingCheckoutCard.tsx)의 문구를 메시지로 옮기고 4개 언어의 결제 화면을 확인해야 합니다.

## 범위를 먼저 정할 기능

서버에는 클립 **본문 수정**, 계정 연결·회원 탈퇴 API가 있지만 현재 FE에 대응 사용자 흐름이 없습니다. API가 존재한다는 이유만으로 모두 필수 기능은 아닙니다. 이번 출시 범위에 포함되는지 정하고, 포함된다면 별도 완료 기준을 추가해야 합니다. 현재의 “이름 변경”을 본문 편집 완료로 계산하면 안 됩니다.
