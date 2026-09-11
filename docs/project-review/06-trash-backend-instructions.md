# BE 에이전트 명령서: 휴지통 클립 원본 내용 반환

## 작업 목적과 범위

`/home/minku/easy-clip-be`에서 휴지통 목록에 클립 원본 내용을 추가한다.
FE는 이 계약을 기준으로 상세 보기와 미리보기를 구현한다. FE 저장소는 수정하지 않는다.
기존 저장소 지침과 사용자 변경을 먼저 확인한다. 커밋·push·배포는 별도 지시를 따른다.

## 응답 계약

기존 `GET /trash?limit=20&cursor=...`의 CLIP 항목에 다음 세 필드를 추가한다.
이름·유형·폴더 ID·삭제일, 페이지 구조와 커서는 유지한다.

| 필드 | 타입 | 내용 |
|---|---|---|
| textContent | string 또는 null | TEXT의 전체 본문. 줄바꿈·공백 보존, 요약·잘라내기 금지 |
| imageUrl | string 또는 null | IMAGE의 실제로 열 수 있는 이미지 URL. 기존 클립 응답과 같은 전달 방식 |
| colorHex | string 또는 null | COLOR의 저장된 색상 코드 |

CLIP 항목에는 세 필드를 명시적으로 반환하며 해당하지 않는 값은 null로 둔다.
FOLDER 항목은 기존 계약을 유지한다. 삭제된 폴더 내부 목록을 새로 노출하는 작업은 이번 범위가 아니다.

예시:
```json
{
  "items": [
    {
      "itemType": "CLIP",
      "id": "clip-1",
      "title": "회의 메모",
      "type": "TEXT",
      "folderId": "folder-1",
      "deletedAt": "2026-09-11T00:00:00.000Z",
      "textContent": "첫째 줄\n둘째 줄",
      "imageUrl": null,
      "colorHex": null
    }
  ],
  "hasNextPage": false,
  "nextCursor": null
}
```

## 수정 위치

1. `src/trash/infrastructure/prisma-trash.repository.ts`
   - `findDeletedItems`의 클립 select에 textContent, imageUrl, colorHex를 추가한다.
   - 기존 workspace 소유자 조건, 삭제 상태, 부모 폴더 상태, Free 접근 제한과 커서 조건을 그대로 유지한다.
2. `src/trash/domain/trash.types.ts`
   - TrashClipItem에 세 필드를 string | null로 추가한다.
3. `src/trash/presentation/dtos/trash-response.dto.ts`
   - TrashClipResponseDto와 TrashItemResponseDto의 Swagger 스키마를 응답과 맞춘다.
   - 통합 DTO에서는 폴더 응답에 존재하지 않는 필드임을 표현한다.
4. 목록 usecase와 페이지 변환에서 세 필드가 유실되지 않는지 확인한다.
5. 기존 테스트 fixture에 필수 필드를 보완하고 아래 검증을 추가한다.

FE의 현재 Next Image 설정은 https://cdn.easy-clip.app 및 로컬 경로를 사용한다. 다른 호스트가 필요하면 URL 계약을 먼저 조율하고, 기존 허용 범위를 임의로 넓히지 않는다.

새 DB 컬럼이나 마이그레이션은 필요하지 않다. 이미 Clip에 저장된 필드를 조회한다.
미리보기를 위해 임시 복구 후 재삭제하거나 일반 활성 클립 API의 삭제 필터를 우회하지 않는다.

## 완료 조건과 검증

- 실제 repository 조회 결과에 TEXT 전체 본문, IMAGE URL, COLOR 코드가 포함된다.
- 제목과 본문이 다른 경우에도 본문 원문을 반환한다. 긴 본문과 여러 줄을 자르지 않는다.
- 폴더 응답과 커서 페이지네이션은 기존과 동일하다.
- 타 계정·다른 workspace·접근 제한 폴더의 내용이 노출되지 않는다.
- 복구·영구 삭제·자동 정리 동작은 바뀌지 않는다.
- 이미지 URL의 실제 표시 가능 여부를 확인한다. private storage를 공개하는 변경은 하지 않는다.
- 관련 단위/통합 테스트, 타입/빌드를 실행하고 결과를 보고한다.
- FE와 계약이 달라져야 한다면 임의 변경하지 말고 필드·이유를 먼저 전달한다.

## FE 연동 상태

FE는 위 세 필드를 읽어 텍스트 요약과 상세 모달을 표시한다. 이미지·색상 원본은 상세 모달에서만 표시한다.
구버전 서버가 필드를 생략하거나 이미지 로드가 실패하면 안내를 표시한다.
FE의 mock E2E 통과는 BE 구현·배포나 실제 이미지 접근 성공을 의미하지 않는다.
BE 완료 후 실제 응답으로 텍스트·이미지·색상 상세 보기를 최종 확인해야 한다.


## BE 구현 검수 결과 · 2026-09-11

- 로컬 `feat/159` 변경은 위 응답 계약과 일치한다. 실제 select, 유형별 null 처리, Swagger와 FE mapper 연결을 확인했다.
- 추가된 통합 테스트는 실제 PostgreSQL repository와 HTTP 응답의 원문·폴더·커서·계정 격리를 검증한다. 기존 E2E 로그에서 77개 통과를 확인했다.
- 검수자가 휴지통 usecase 테스트 23개와 제품 빌드 범위 타입 검사를 직접 실행해 통과했다.
- 전체 테스트 소스까지 포함한 타입 검사는 변경 범위 밖의 `auth-cookie.helper.spec.ts:66`, `cors.helper.spec.ts:59`에서 실패했다. 제품 빌드 범위 통과와 구분한다.
- 개선 권장: `findDeletedClipsByIds`·`findDeletedClipById`에도 전체 본문 조회가 추가됐다. 복구·삭제 사전 확인에는 본문이 필요 없으므로 메타데이터 타입과 목록 내용 타입을 분리하면 불필요한 읽기를 줄일 수 있다. 상세 보기의 기능 차단 문제는 아니다.
- 실행 환경 불일치 확인: FE 설정의 API는 `http://localhost:3000`이고 `easyclip-api` 컨테이너가 서비스한다. 검수 시 컨테이너의 `findDeletedItems`에는 textContent·imageUrl·colorHex가 없었다. 로컬 소스/빌드에는 필드가 존재하므로 컨테이너 갱신 후 휴지통 새로고침과 실제 응답 검증이 필요하다.
- 원본 없음 안내를 없애려고 FE에서 제목을 본문으로 대체하지 않는다. 새 서버 응답과 DB에 실제 원본이 있어야 한다.
