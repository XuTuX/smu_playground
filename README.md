# SMU 놀이터

세명대학교 학과 대항 ESP32 미니게임 행사를 위한 Next.js 아케이드 웹사이트입니다. 회원가입 없이 게임 점수가 기기에서 자동으로 도착하고, 학생은 학과와 닉네임만 입력해 랭킹에 등록합니다.

현재 버전은 요청에 따라 **Supabase를 사용하지 않습니다.** realistic mock seed와 서버 메모리 저장소로 전체 현장 흐름을 바로 테스트할 수 있습니다.

## 실행

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000)을 엽니다.

## 주요 경로

- `/` — 학과 대항전 포디움과 전체 순위
- `/games` — 5개 미니게임
- `/games/flappy` — 게임별 TOP 10
- `/play/GAME_01` — 관리자 인증 후 사용하는 현장 등록 화면
- `/ranking` — 개인 랭킹과 필터
- `/departments` — 홈의 학과 종합 랭킹으로 이동
- `/departments/ai-computer` — 학과별 게임 TOP 5
- `/admin` — 보호된 로컬 운영 콘솔

개발 환경의 `/play/GAME_01` 하단에는 개발용 점수 테스트 도구가 표시됩니다. 점수를 전송하면 준비 화면이 자동으로 점수 등록 화면으로 바뀝니다.

현장 등록 화면과 관련 세션 API는 관리자 쿠키가 있어야 접근할 수 있습니다. 일반 사용자용 게임·랭킹 페이지에는 등록 화면 링크가 표시되지 않으며, 관리자는 `/admin` 로그인 후 기기별 등록 화면을 열 수 있습니다.

## 환경 변수

```bash
cp .env.example .env.local
```

```text
DEVICE_API_KEY=ESP32 요청용 비밀 키
ADMIN_PASSWORD=관리자 비밀번호
ADMIN_SESSION_SECRET=관리자 쿠키 서명 키
NEXT_PUBLIC_REGISTERED_RESET_SECONDS=12
```

개발 환경에서는 simulator에 `dev-local` 기기 키를 허용하며, 관리자 기본 비밀번호는 `playground`입니다. 프로덕션에서는 반드시 환경 변수를 설정해야 합니다.

## ESP32 점수 API

```http
POST /api/device/score
X-DEVICE-KEY: <DEVICE_API_KEY>
Content-Type: application/json
```

```json
{
  "device_id": "GAME_01",
  "game_id": "flappy",
  "score": 37,
  "event_id": "A1B2C3D4-12345-1"
}
```

각 요청은 고유 `game_session`으로 만들어집니다. 같은 `event_id`를 재전송해도 세션이 중복 생성되지 않으며, 태블릿이 한 세션을 표시하는 동안 다음 점수가 도착해도 현재 학생 화면을 덮어쓰지 않습니다.

## ESP32 연결

1. `firmware/smu_score_client/secrets.example.h`를 같은 폴더의 `secrets.h`로 복사합니다.
2. Wi-Fi 정보, 서버의 LAN 주소, `DEVICE_API_KEY`를 입력합니다.
3. `smu_score_client.ino`에서 기기에 맞는 `DEVICE_ID`와 `GAME_ID`를 설정합니다.
4. 실제 게임 종료 지점에서 `sendGameScore(finalScore)`를 한 번 호출합니다.

로컬 테스트에서 ESP32의 서버 주소는 `localhost`가 아니라 Next.js를 실행하는 컴퓨터의 LAN IP여야 합니다. 제공된 예제는 전송 실패 시 동일한 `event_id`로 최대 세 번 재시도합니다.

## 검증

```bash
npm run lint
npx tsc --noEmit
npm run build
```

상세 구조와 후속 PostgreSQL 제안은 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)를 참고하세요.
# smu_playground
