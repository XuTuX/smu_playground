# SMU 놀이터 아키텍처

## 전체 흐름

```text
관리자 /admin
  │
  ├─ 전화번호 조회 ─> GET /api/admin/participants/[phone] ─> students / teams
  │
  └─ 점수 등록 ───> POST /api/admin/scores
                       │
                       └─> upsert_admin_score_v3() ─> students / teams + scores

공개 화면 ─> Next.js 서버 ─> Supabase REST ─> 랭킹 계산
```

- 웹 브라우저는 Supabase secret key를 받지 않습니다.
- 모든 Supabase 요청은 `server-only` 모듈을 통해 Next.js 서버에서만 실행됩니다.
- 관리자 API는 기존 HttpOnly 서명 쿠키 인증을 그대로 사용합니다.
- 전화번호는 관리자 조회·관리 API 외에 노출하지 않으며, 공개 랭킹 데이터에도 포함되지 않습니다.

## 데이터 모델

- `colleges`: 단과대학 기준 정보
- `departments`: 학과 기준 정보
- `games`: 게임, 최대 점수, 활성 상태
- `students`: 개인 참가자의 전화번호, 닉네임, 학과. 신규 개인 참가자는 전화번호로 식별합니다. 기존 학번 필드는 과거 데이터 보존용으로만 남습니다.
- `teams`: 팀 대표자 전화번호, 팀명, 학과. 팀명과 무관하게 대표자 전화번호로 팀을 식별합니다.
- `scores`: 개인 또는 팀과 게임별 최고 점수. `student_id`와 `team_id` 중 하나만 연결되며 `deleted_at`이 있는 기록은 공개·관리 목록에서 제외됩니다.
- `score_audit_log`: 점수 생성·수정·삭제·복원 전후 값을 보관하는 운영 감사 로그

`upsert_admin_score_v3` 함수는 참가 유형·전화번호·게임 단위 advisory transaction lock을 사용합니다. 동시 요청이 와도 신규 참가자 생성과 최고 점수 비교·갱신이 하나의 트랜잭션에서 순서대로 처리됩니다. 삭제된 동일 기록을 다시 등록하면 새 행을 만들지 않고 복원합니다.

화면에 표시하는 게임 정의의 기준은 `data/games.ts`입니다. 게임 이름·점수 범위·경기 방식이 바뀌면 같은 변경에 DB `games` 갱신 마이그레이션을 반드시 포함해 API 검증 기준과 화면이 어긋나지 않게 합니다.

## 보안

- `public` 스키마의 모든 테이블에 RLS를 활성화합니다.
- `anon`, `authenticated`에는 테이블 권한이 없습니다.
- `service_role`만 테이블과 `upsert_admin_score` 함수를 사용합니다.
- DB 함수는 `SECURITY INVOKER`로 실행되며 `search_path` 고정과 입력값 검증을 적용합니다.
- 닉네임·팀명, 전화번호, 점수 범위는 API와 DB 양쪽에서 검증합니다.
- 관리자 변경 API는 HttpOnly·SameSite 쿠키 외에도 same-origin 검사와 요청 횟수 제한을 적용합니다.
- 운영 환경에서는 관리자 비밀번호와 세션 비밀키에 안전하지 않은 기본값을 제공하지 않습니다.

## 마이그레이션

`supabase/migrations/20260908065355_admin_student_scores.sql`이 기준 데이터, RLS, 권한을 포함하며 이후 마이그레이션이 관리자 수정·삭제와 팀전·감사 로그를 확장합니다. 파일명 순서대로 모두 적용해야 합니다.
