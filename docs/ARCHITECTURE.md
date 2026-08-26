# SMU 놀이터 아키텍처

> 현재 구현 단계에서는 요청에 따라 Supabase를 사용하지 않는다. 아래 PostgreSQL 설계는 후속 연결을 위한 제안이며, 실행 중인 앱은 `lib/mock-store.ts`의 로컬 메모리 저장소와 mock seed를 사용한다.

## 1. 전체 구조

SMU 놀이터는 Next.js App Router가 화면과 BFF(Route Handler)를 함께 제공하고, Supabase PostgreSQL이 영속 데이터와 공개 랭킹 조회를 담당하는 단일 웹 애플리케이션이다.

```text
ESP32 ── X-DEVICE-KEY ──> POST /api/device/score
                                  │
                                  ▼
                         game_sessions(pending)
                                  │
태블릿 /play/[deviceId] <── polling + optional Realtime
          │                       │
          └── session_id 고정 ────┘
                    │
                    ▼
          POST /api/sessions/[id]/register
                    │
                    ▼ atomic DB function
          game_sessions(registered) + scores
                    │
                    ▼
          홈 / 개인 랭킹 / 학과 랭킹
```

- 읽기: 공개 랭킹과 행사 현황은 publishable key + RLS로 조회한다.
- 쓰기: 점수 수신, 점수 등록, 관리자 변경은 Next.js 서버의 secret key로만 수행한다.
- 동시성: `scores.session_id` unique constraint와 조건부 상태 변경을 한 DB 함수 안에서 처리한다.
- 복원력: Realtime은 화면 갱신을 빠르게 하는 보조 수단이다. `/play`는 짧은 polling, 공개 화면은 새로고침/주기 갱신으로도 정상 동작한다.
- 로컬 실행: Supabase 환경 변수가 없으면 동일한 DTO를 반환하는 realistic mock data와 메모리 기반 session store를 사용한다.

## 2. 디렉터리 제안

```text
app/
  api/
    device/score/route.ts
    play/[deviceId]/session/route.ts
    sessions/[sessionId]/register/route.ts
    admin/{login,logout,snapshot,action}/route.ts
  games/[gameId]/page.tsx
  play/[deviceId]/page.tsx
  ranking/page.tsx
  departments/[departmentId]/page.tsx
  departments/page.tsx
  admin/page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  layout/{Header,MobileNav}.tsx
  ui/{RetroCard,MonoLabel,PressableLink,StatusBadge}.tsx
  games/GameCard.tsx
  ranking/{RankingRow,RankingPodium}.tsx
  activity/{ActivityGrid,ActivityFeed}.tsx
  play/PlayConsole.tsx
  admin/AdminConsole.tsx
data/
  departments.ts
  games.ts
  mock.ts
lib/
  data/dashboard.ts
  ranking.ts
  validation.ts
  mock-store.ts
  supabase/{browser,server,types}.ts
supabase/
  migrations/
  seed.sql
docs/
  ARCHITECTURE.md
```

페이지는 가능한 한 Server Component로 유지하고, polling·검색·폼·Realtime처럼 상호작용이 필요한 작은 경계만 Client Component로 만든다. DB 접근은 `lib/data`와 `lib/supabase`에 모아 client bundle로 비밀 값이 넘어가지 않게 한다.

## 3. DB 스키마

### 핵심 테이블

- `colleges`: 단과대학과 표시 순서.
- `departments`: 단과대학 소속 학과, slug, 활성 상태.
- `games`: 게임, ESP32 device ID, 점수 단위, 최대 허용 점수, 활성 상태.
- `game_sessions`: ESP32가 보낸 아직 소유자가 없는 점수. `pending | registered | expired` 상태를 가진다.
- `scores`: 학과와 닉네임이 확정된 기록. `session_id`가 unique라 세션당 한 번만 생성된다.
- `event_settings`: 등록 완료 화면 timeout 등 행사 운영 설정.

### 인덱스와 제약

- `game_sessions(device_id, created_at desc) where status = 'pending'`: 기기별 최신 대기 점수 조회.
- `scores(game_id, score desc, created_at asc)`: 게임 TOP 10.
- `scores(department_id, game_id, score desc)`: 학과별·게임별 TOP 5 합산.
- 모든 FK column에 index를 둔다.
- 점수는 `0 <= score <= games.max_score`를 API에서 확인하고, DB에서는 음수 방지 check를 둔다.
- 닉네임은 trim 후 2~12자, 제어문자/HTML tag를 거부한다.

### 권한 모델

- 모든 public table에 RLS를 활성화한다.
- `anon`, `authenticated`에는 활성 학과/게임과 확정된 `scores`의 SELECT만 명시적으로 허용한다.
- `game_sessions`, 관리자용 설정의 공개 정책은 만들지 않는다.
- INSERT/UPDATE/DELETE와 `register_game_session` 함수 실행은 server의 `service_role`만 가능하다.
- 랭킹 view는 `security_invoker = true`로 생성해 기반 테이블 RLS를 그대로 따른다.

### 랭킹 계산

학과 점수는 각 게임에서 해당 학과의 TOP 5 기록만 더한 뒤, 모든 게임의 소계를 합산한다. 계산은 `dense_rank() over (partition by department_id, game_id order by score desc)`를 사용하는 DB view로 분리한다. 추후 normalization이 필요하면 view의 게임별 소계 단계만 교체한다.

## 4. 핵심 UI 구조

### 홈페이지 `/`

```text
Header: SMU PLAYGROUND / 주요 메뉴 / LIVE
Hero: CURRENT SMU CHAMPION + 1위 학과 + 총점 + #1 badge
Summary: PLAYERS / TODAY'S PLAYS / HOT GAME
Battle map: 최근 참가 heatmap + 범례
Department ranking: TOP 5와 점수 bar
Live activity: 최근 등록 기록
Games: 5개 cartridge형 카드
Mobile bottom navigation
```

cream dot-grid 배경 위에 3px 검은 border, 8px hard shadow, yellow/pink/sky/mint 색을 제한적으로 사용한다. 모노 레이블과 큰 굵은 숫자를 명확히 분리한다.

### 게임기 화면 `/play/[deviceId]`

한 페이지 안에서 다음 상태 머신으로 동작한다.

```text
READY ── 새 pending session 감지 ──> SCORE + FORM
  ▲                                      │
  │                                      │ submit(session_id)
  │                                      ▼
  └──── configurable timeout ───── REGISTERED
```

- READY: 폼을 숨기고 게임명, 연결 상태, “게임을 시작해주세요”만 크게 표시한다.
- SCORE: 감지 순간의 `session_id`를 local state에 고정한다. 이후 새 점수가 와도 현재 화면은 바뀌지 않는다.
- FORM: searchable department combobox와 nickname만 제공한다. score input은 존재하지 않는다.
- REGISTERED: 개인 순위, 학과 순위, 등록 점수를 보여주고 설정된 시간 뒤 READY로 돌아간다.
- 태블릿 landscape에서는 점수 영역과 입력 영역을 2열로, 모바일에서는 1열로 배치한다.

## 5. 운영 환경 변수

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
DEVICE_API_KEY=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
NEXT_PUBLIC_REGISTERED_RESET_SECONDS=12
```

legacy 프로젝트는 publishable/secret key 위치에 anon/service-role key를 넣어도 동작하도록 호환한다. `SUPABASE_SECRET_KEY`, `DEVICE_API_KEY`, 관리자 비밀 값은 절대 `NEXT_PUBLIC_` 접두사를 사용하지 않는다.
