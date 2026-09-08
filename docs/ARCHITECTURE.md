# SMU 놀이터 아키텍처

## 전체 흐름

```text
관리자 /admin
  │
  ├─ 학번 조회 ─> GET /api/admin/students/[studentId] ─> students
  │
  └─ 점수 등록 ─> POST /api/admin/scores
                       │
                       └─> upsert_admin_score() ─> students + scores

공개 화면 ─> Next.js 서버 ─> Supabase REST ─> 랭킹 계산
```

- 웹 브라우저는 Supabase secret key를 받지 않습니다.
- 모든 Supabase 요청은 `server-only` 모듈을 통해 Next.js 서버에서만 실행됩니다.
- 관리자 API는 기존 HttpOnly 서명 쿠키 인증을 그대로 사용합니다.
- 학번은 관리자 조회 API 외에 노출하지 않으며, 공개 랭킹 데이터에도 포함되지 않습니다.

## 데이터 모델

- `colleges`: 단과대학 기준 정보
- `departments`: 학과 기준 정보
- `games`: 게임, 최대 점수, 활성 상태
- `students`: 학번, 닉네임, 학과. 학번은 unique입니다.
- `scores`: 학생·게임별 최고 점수. `(student_id, game_id)`가 unique입니다.

`upsert_admin_score` 함수는 학번·게임 단위 advisory transaction lock을 사용합니다. 동시 요청이 와도 신규 학생 생성과 최고 점수 비교·갱신이 하나의 트랜잭션에서 순서대로 처리됩니다.

## 보안

- `public` 스키마의 모든 테이블에 RLS를 활성화합니다.
- `anon`, `authenticated`에는 테이블 권한이 없습니다.
- `service_role`만 테이블과 `upsert_admin_score` 함수를 사용합니다.
- DB 함수는 `SECURITY INVOKER`로 실행되며 `search_path` 고정과 입력값 검증을 적용합니다.
- 닉네임, 학번, 점수 범위는 API와 DB 양쪽에서 검증합니다.

## 마이그레이션

`supabase/migrations/20260908065355_admin_student_scores.sql`이 기준 데이터, RLS, 권한, 점수 등록 함수를 포함합니다.
