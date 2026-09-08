# 이슈 등록 결과

등록일: 2026-09-08 · 프로젝트 기준: `dev/e8b47e2`

19개 원본 항목 중 4개를 제외하고 15개를 등록했다. 배포 환경에서 재현되지 않은 문제는 조사 범위를 명시했다.

## 제외한 항목

| 원본 번호 | 항목 | 제외 근거 |
| --- | --- | --- |
| 3 | Pro 버튼 색상 | 완료 이슈 #134·#106 및 현재 전용 CTA·색상 토큰 구현. 새로운 재발 증거 없이 중복 등록하지 않음 |
| 4 | 비로그인 요금제 접근 | 현재 proxy의 공개 경로, public 페이지 배치 및 비로그인 요금제 E2E 존재. 배포 재발 시 별도 추적 |
| 7 | 태그 관리·배치 | #143 완료 및 PR #148 반영 |
| 13 | public/protected·AuthGuard | #141 완료 및 보호 레이아웃의 AuthGuard 확인 |

## 등록한 이슈

| 원본 번호 | 이슈 |
| --- | --- |
| 1 | [#149 [bug] 최근 항목 클립 즐겨찾기 버튼 이벤트 연결 누락](https://github.com/gksktl111/easy-clip-fe/issues/149) |
| 2 | [#150 [bug] 최하단 폴더의 한 칸 위 이동 실패 재현 및 수정](https://github.com/gksktl111/easy-clip-fe/issues/150) |
| 5 | [#151 [bug] 클립 변경 후 기존 조회 목록 유실 재현 및 수정](https://github.com/gksktl111/easy-clip-fe/issues/151) |
| 6 | [#152 [bug] 배포 환경 화면 이동 시 설정 조회 지연 원인 분석 및 개선](https://github.com/gksktl111/easy-clip-fe/issues/152) |
| 8 | [#153 [feature] Free 플랜 폴더 생성 한도 안내 및 제한 UI 추가](https://github.com/gksktl111/easy-clip-fe/issues/153) |
| 9 | [#154 [feature] 구독 만료 후 폴더 잠금 정책과 권한 안내 추가](https://github.com/gksktl111/easy-clip-fe/issues/154) |
| 10 | [#155 [feature] 전역 404 페이지와 미등록 경로 처리 추가](https://github.com/gksktl111/easy-clip-fe/issues/155) |
| 11 | [#156 [improvement] 기본 카테고리 및 사용자 폴더 URL 구조 정리](https://github.com/gksktl111/easy-clip-fe/issues/156) |
| 12 | [#157 [improvement] 검색어와 목록 조건을 URL Query String으로 관리](https://github.com/gksktl111/easy-clip-fe/issues/157) |
| 14 | [#158 [improvement] 클립 붙여넣기 수집 및 생성 후 재조회 범위 개선](https://github.com/gksktl111/easy-clip-fe/issues/158) |
| 15 | [#159 [improvement] 클립 Query Cache와 Infinite Query 동기화 정책 정리](https://github.com/gksktl111/easy-clip-fe/issues/159) |
| 16 | [#160 [improvement] 아이콘과 폰트의 역할별 디자인 기준 통일](https://github.com/gksktl111/easy-clip-fe/issues/160) |
| 17 | [#161 [improvement] 폴더 드래그 삽입 표시와 정렬 상호작용 개선](https://github.com/gksktl111/easy-clip-fe/issues/161) |
| 18 | [#162 [improvement] 다국어 호출 책임 정리 및 사용자 문구 하드코딩 제거](https://github.com/gksktl111/easy-clip-fe/issues/162) |
| 19 | [#163 [improvement] 클립과 폴더 도메인 경계 및 협력 계약 정리](https://github.com/gksktl111/easy-clip-fe/issues/163) |

9번은 이미 구현된 해지 안내·종료일·재개 액션을 제외하고 잠금 권한과 정책만 추가한다. 2번은 UI/API 재현 조사부터 수행한다. 관련 작업은 각 이슈 본문에 상호 연결했다.
