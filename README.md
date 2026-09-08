# SMU 놀이터

세명대학교 학과 대항 미니게임 행사용 Next.js 웹사이트입니다. 관리자가 학번, 학과, 닉네임, 게임, 점수를 입력하면 Supabase에 저장되고 공개 랭킹에 즉시 반영됩니다.

## 운영 흐름

1. `/admin`에서 관리자로 로그인합니다.
2. 학번을 입력합니다.
3. 기존 학생이면 닉네임과 학과가 자동으로 채워집니다. 신규 학생이면 학과와 닉네임을 입력합니다.
4. 게임과 점수를 선택해 등록합니다.
5. 같은 학번·게임의 기록이 이미 있으면 더 높은 점수만 반영됩니다.

ESP32 점수 수신, 대기 세션, 태블릿 현장 등록 흐름은 사용하지 않습니다.

## 환경 변수

```bash
cp .env.example .env.local
```

```text
SUPABASE_URL=https://nlrvwfjrmqnqjfhruckf.supabase.co
SUPABASE_SECRET_KEY=Supabase Dashboard의 sb_secret_... 키
ADMIN_PASSWORD=관리자 비밀번호
ADMIN_SESSION_SECRET=관리자 쿠키 서명 키
```

`SUPABASE_SECRET_KEY`는 반드시 서버 환경 변수로만 설정하고 `NEXT_PUBLIC_` 접두사를 붙이지 마세요. Supabase 환경 변수가 없는 로컬 환경에서는 mock 점수로 UI를 확인할 수 있습니다.

## 실행과 검증

```bash
npm install
npm run dev
```

```bash
npm run lint
npx tsc --noEmit
npm run build
```

데이터베이스 구조와 보안 모델은 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)를 참고하세요.
