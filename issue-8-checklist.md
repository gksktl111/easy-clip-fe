# Issue #8 구현 체크리스트

## 1) 기본 UI/상태
- [x] 활성/비활성 인디케이터(검색창 좌측 빨강/초록) 표시
  - 파일: src/components/clips/FilterBar.tsx, src/app/(app)/[id]/page.tsx
  - 변경 내용: 검색창 좌측 상태 인디케이터/라벨 추가, 페이지 클릭 시 활성화 및 window blur 시 비활성 처리
- [x] 상단 카테고리 탭(All/Text/Color/Image) UI 배치
  - 파일: src/components/clips/FilterBar.tsx
  - 변경 내용: 기존 필터 탭 UI 재사용
- [x] 검색창 UI 및 이름 기반 필터링 연결
  - 파일: src/components/clips/FilterBar.tsx, src/app/(app)/[id]/page.tsx
  - 변경 내용: 검색 입력 값 상태 연결 및 content 기반 필터링 추가

## 2) 클립 카드 및 동작
- [x] 카드 레이아웃/스타일(clipcard.png 참고)
  - 파일: src/components/clips/ClipItem.tsx
  - 변경 내용: 카드형 레이아웃(상단 컨텐츠/하단 이름), 타입별 렌더링 및 즐겨찾기 아이콘 배치
- [x] 좌클릭 복사 동작
  - 파일: src/components/clips/ClipItem.tsx, src/app/(app)/[id]/page.tsx
  - 변경 내용: 카드 클릭 시 클립 내용 클립보드 복사
- [x] 우클릭 옵션 모달(이름 변경/삭제)
  - 파일: src/app/(app)/[id]/page.tsx
  - 변경 내용: 우클릭 컨텍스트 메뉴 + 이름 변경 모달 + 삭제 처리
- [x] 우측 상단 즐겨찾기 토글
  - 파일: src/components/clips/ClipItem.tsx, src/app/(app)/[id]/page.tsx
  - 변경 내용: 즐겨찾기 토글 아이콘 및 저장 연동

## 3) 붙여넣기 캡처
- [x] 활성 상태에서 Ctrl+V / Cmd+V 붙여넣기 캡처
  - 파일: src/app/(app)/[id]/page.tsx
  - 변경 내용: paste 이벤트에서 텍스트/이미지 캡처 후 클립 생성

## 4) 삭제 모달
- [x] Delete All Clips 버튼 + 확인 모달
  - 파일: src/app/(app)/[id]/page.tsx
  - 변경 내용: 전체 삭제 확인 모달 및 확인 삭제 동작 추가

## 5) 그리드/반응형
- [x] 1200px 이상 5열, 768px 이상 3열, 400px 이하 1열
  - 파일: src/components/clips/ClipList.tsx
  - 변경 내용: min-[401px] 2열, md 3열, min-[1200px] 5열로 반응형 그리드 적용
- [x] 중간 구간(400~768) 최적 열 수 확정 및 적용
  - 파일: src/components/clips/ClipList.tsx
  - 변경 내용: 401px 이상 2열로 설정

## 6) 상태 연동
- [x] 즐겨찾기 상태가 Favorites 탭에 반영
  - 파일: src/app/(app)/favorites/page.tsx
  - 변경 내용: 로컬 스토리지 기반 즐겨찾기 필터링 연동
- [x] 폴더별 클립 상태 저장/조회(로컬 스토리지)
  - 파일: src/app/(app)/[id]/page.tsx
  - 변경 내용: 폴더별 클립 저장/조회 및 변경 이벤트 연동
