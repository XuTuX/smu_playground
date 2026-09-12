# SMU 놀이터

세명대학교 학과 대항 미니게임 행사용 Next.js 웹사이트입니다. 관리자가 참가자 전화번호, 학과, 닉네임 또는 팀명, 게임, 점수를 입력하면 Supabase에 저장되고 공개 랭킹에 반영됩니다.

## 운영 흐름

1. `/admin`에서 관리자로 로그인합니다.
2. 개인전은 참가자 전화번호, 팀전은 대표자 전화번호를 입력합니다.
3. 기존 참가자 또는 팀이면 이름과 학과가 자동으로 채워집니다. 신규 참가자라면 학과와 닉네임 또는 팀명을 입력합니다.
4. 개인전은 닉네임, 팀전은 팀명을 사용합니다.
5. 게임과 점수를 선택해 등록합니다.
6. 같은 전화번호·참가 유형·게임의 기록이 이미 있으면 더 높은 점수만 반영됩니다.

ESP32 점수 수신, 대기 세션, 태블릿 현장 등록 흐름은 사용하지 않습니다.

## 환경 변수

```bash
cp .env.example .env.local
```

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=Supabase Dashboard의 sb_secret_... 키
ADMIN_PASSWORD=10자 이상의 관리자 비밀번호
ADMIN_SESSION_SECRET=32자 이상의 관리자 쿠키 서명 키
ENABLE_MOCK_DATA=true
```

`SUPABASE_SECRET_KEY`는 반드시 서버 환경 변수로만 설정하고 `NEXT_PUBLIC_` 접두사를 붙이지 마세요. 샘플 데이터는 개발 환경에서만 사용할 수 있으며 `ENABLE_MOCK_DATA=false`로 완전히 끌 수 있습니다. 운영 환경에서는 Supabase 오류가 발생해도 샘플 순위로 대체하지 않습니다.

## 데이터베이스 적용

배포 전 Supabase 프로젝트에 `supabase/migrations`의 마이그레이션을 시간순으로 적용하세요. 최신 마이그레이션은 팀명을 학생 닉네임에서 분리하고, 점수 삭제를 복구 가능한 소프트 삭제로 바꾸며, 수정·삭제 이력을 `score_audit_log`에 남깁니다.

Supabase CLI가 설치된 환경에서는 적용 전에 `supabase db advisors`를 실행하고, 적용 후 `supabase migration list`와 관리자 등록·수정·삭제 흐름을 확인하세요.

## 실행과 검증

```bash
npm install
npm run dev
```

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

전체 검사는 `npm run check`로 한 번에 실행할 수 있습니다.

데이터베이스 구조와 보안 모델은 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)를 참고하세요.
