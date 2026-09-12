create table if not exists public.colleges (
  id text primary key,
  name text not null,
  sort_order integer not null check (sort_order > 0)
);

create table if not exists public.departments (
  id text primary key,
  college_id text not null references public.colleges(id) on update cascade,
  name text not null,
  slug text not null unique,
  sort_order integer not null check (sort_order > 0),
  is_active boolean not null default true
);

create index if not exists departments_college_id_idx on public.departments(college_id);

create table if not exists public.games (
  id text primary key,
  slug text not null unique,
  code text not null unique,
  name text not null,
  description text not null,
  accent text not null check (accent in ('yellow', 'pink', 'sky', 'mint', 'orange')),
  max_score integer not null check (max_score >= 0),
  is_active boolean not null default true
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  student_number text not null unique check (student_number ~ '^[0-9]{6,12}$'),
  department_id text not null references public.departments(id) on update cascade,
  nickname text not null check (
    char_length(btrim(nickname)) between 2 and 12
    and nickname !~ '[<>[:cntrl:]]'
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists students_department_id_idx on public.students(department_id);

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  game_id text not null references public.games(id) on update cascade,
  score integer not null check (score >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, game_id)
);

create index if not exists scores_game_score_idx on public.scores(game_id, score desc, updated_at asc);
create index if not exists scores_student_id_idx on public.scores(student_id);

alter table public.colleges enable row level security;
alter table public.departments enable row level security;
alter table public.games enable row level security;
alter table public.students enable row level security;
alter table public.scores enable row level security;

revoke all on table public.colleges from anon, authenticated;
revoke all on table public.departments from anon, authenticated;
revoke all on table public.games from anon, authenticated;
revoke all on table public.students from anon, authenticated;
revoke all on table public.scores from anon, authenticated;

grant usage on schema public to service_role;
grant select, insert, update, delete on table public.colleges to service_role;
grant select, insert, update, delete on table public.departments to service_role;
grant select, insert, update, delete on table public.games to service_role;
grant select, insert, update, delete on table public.students to service_role;
grant select, insert, update, delete on table public.scores to service_role;

insert into public.colleges (id, name, sort_order) values
  ('humanities-arts', '인문예술대학', 1),
  ('social-sciences', '사회과학대학', 2),
  ('ai-convergence', 'AI융합대학', 3),
  ('health-bio', '보건바이오대학', 4),
  ('oriental-medicine', '한의과대학', 5),
  ('liberal-arts', '교양대학', 6)
on conflict (id) do update set
  name = excluded.name,
  sort_order = excluded.sort_order;

insert into public.departments (id, college_id, name, slug, sort_order, is_active) values
  ('media-content', 'humanities-arts', '미디어콘텐츠창작학과', 'media-content', 1, true),
  ('foreign-languages', 'humanities-arts', '외국어학부', 'foreign-languages', 2, true),
  ('art-industrial-design', 'humanities-arts', '아트&산업디자인학과', 'art-industrial-design', 3, true),
  ('interior-design', 'humanities-arts', '실내디자인학과', 'interior-design', 4, true),
  ('visual-video-design', 'humanities-arts', '시각·영상디자인학과', 'visual-video-design', 5, true),
  ('fashion-design', 'humanities-arts', '패션디자인학과', 'fashion-design', 6, true),
  ('performing-arts', 'humanities-arts', '공연예술학과', 'performing-arts', 7, true),
  ('film-webtoon-animation', 'humanities-arts', '영화웹툰애니메이션학과', 'film-webtoon-animation', 8, true),
  ('police', 'social-sciences', '경찰학과', 'police', 1, true),
  ('law', 'social-sciences', '법학과', 'law', 2, true),
  ('real-estate-cadastral', 'social-sciences', '부동산지적학과', 'real-estate-cadastral', 3, true),
  ('fire-disaster', 'social-sciences', '소방방재학과', 'fire-disaster', 4, true),
  ('business', 'social-sciences', '경영학과', 'business', 5, true),
  ('accounting-tax-finance', 'social-sciences', '회계세무금융학과', 'accounting-tax-finance', 6, true),
  ('hotel-management', 'social-sciences', '호텔경영학과', 'hotel-management', 7, true),
  ('airline-service', 'social-sciences', '항공서비스학과', 'airline-service', 8, true),
  ('advertising-pr', 'social-sciences', '광고홍보학과', 'advertising-pr', 9, true),
  ('social-welfare', 'social-sciences', '사회복지학과', 'social-welfare', 10, true),
  ('counseling-psychology', 'social-sciences', '상담심리학과', 'counseling-psychology', 11, true),
  ('ai-computer', 'ai-convergence', 'AI컴퓨터학부', 'ai-computer', 1, true),
  ('smart-it', 'ai-convergence', '스마트IT학부', 'smart-it', 2, true),
  ('electrical-electronics', 'ai-convergence', '전기전자공학과', 'electrical-electronics', 3, true),
  ('architecture', 'ai-convergence', '건축학과', 'architecture', 4, true),
  ('disaster-safety', 'ai-convergence', '재난안전학과', 'disaster-safety', 5, true),
  ('health-safety-engineering', 'ai-convergence', '보건안전공학과', 'health-safety-engineering', 6, true),
  ('nursing', 'health-bio', '간호학과', 'nursing', 1, true),
  ('occupational-therapy', 'health-bio', '작업치료학과', 'occupational-therapy', 2, true),
  ('clinical-pathology', 'health-bio', '임상병리학과', 'clinical-pathology', 3, true),
  ('biopharma-industry', 'health-bio', '바이오제약산업학부', 'biopharma-industry', 4, true),
  ('biocosmetics', 'health-bio', '바이오코스메틱학과', 'biocosmetics', 5, true),
  ('beauty-care', 'health-bio', '뷰티케어학과', 'beauty-care', 6, true),
  ('food-nutrition', 'health-bio', '바이오식품영양학부', 'food-nutrition', 7, true),
  ('animal-health', 'health-bio', '동물보건학과', 'animal-health', 8, true),
  ('companion-animal', 'health-bio', '반려동물산업학과', 'companion-animal', 9, true),
  ('sports-leisure', 'health-bio', '생활체육학과', 'sports-leisure', 10, true),
  ('oriental-medicine-major', 'oriental-medicine', '한의학과', 'oriental-medicine-major', 1, true),
  ('open-major', 'liberal-arts', '자율전공학부', 'open-major', 1, true)
on conflict (id) do update set
  college_id = excluded.college_id,
  name = excluded.name,
  slug = excluded.slug,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

insert into public.games (id, slug, code, name, description, accent, max_score, is_active) values
  ('flappy', 'flappy', 'GAME 01', '1D FLAPPY', '버튼으로 장애물을 피해 최대한 오래 살아남기', 'yellow', 999, true),
  ('reaction', 'reaction', 'GAME 02', 'REACTION', 'LED 신호가 나타나면 누구보다 빠르게 버튼 누르기', 'pink', 999, true),
  ('dino-run', 'dino-run', 'GAME 03', 'DINO RUN', '다가오는 장애물을 타이밍에 맞춰 점프하기', 'sky', 999, true),
  ('timing', 'timing', 'GAME 04', 'TIMING', '움직이는 LED를 목표 지점에 정확히 멈추기', 'mint', 999, true),
  ('rhythm', 'rhythm', 'GAME 05', 'RHYTHM', 'LED 리듬에 맞춰 정확하게 버튼 입력하기', 'orange', 999, true)
on conflict (id) do update set
  slug = excluded.slug,
  code = excluded.code,
  name = excluded.name,
  description = excluded.description,
  accent = excluded.accent,
  max_score = excluded.max_score,
  is_active = excluded.is_active;

create or replace function public.upsert_admin_score(
  p_student_number text,
  p_game_id text,
  p_department_id text,
  p_nickname text,
  p_score integer
)
returns table (
  result_status text,
  result_previous_score integer,
  result_score_id uuid,
  result_student_id uuid,
  result_nickname text,
  result_department_id text,
  result_game_id text,
  result_score integer,
  result_updated_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_student public.students%rowtype;
  v_score public.scores%rowtype;
  v_max_score integer;
  v_now timestamptz := clock_timestamp();
  v_nickname text := btrim(p_nickname);
  v_student_number text := btrim(p_student_number);
begin
  if v_student_number !~ '^[0-9]{6,12}$' then
    raise exception '학번은 숫자 6~12자리여야 합니다.' using errcode = '22023';
  end if;

  select g.max_score
    into v_max_score
    from public.games as g
   where g.id = p_game_id
     and g.is_active;

  if not found then
    raise exception '활성 게임을 찾을 수 없습니다.' using errcode = '22023';
  end if;

  if p_score is null or p_score < 0 or p_score > v_max_score then
    raise exception '점수는 0~% 정수여야 합니다.', v_max_score using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_student_number || ':' || p_game_id, 0)
  );

  select s.*
    into v_student
    from public.students as s
   where s.student_number = v_student_number
   for update;

  if not found then
    if not exists (
      select 1
        from public.departments as d
       where d.id = p_department_id
         and d.is_active
    ) then
      raise exception '활성 학과를 선택해주세요.' using errcode = '22023';
    end if;

    if char_length(v_nickname) < 2
       or char_length(v_nickname) > 12
       or v_nickname ~ '[<>[:cntrl:]]' then
      raise exception '닉네임은 특수 제어문자 없이 2~12자로 입력해주세요.' using errcode = '22023';
    end if;

    insert into public.students (student_number, department_id, nickname, created_at, updated_at)
    values (v_student_number, p_department_id, v_nickname, v_now, v_now)
    returning * into v_student;
  end if;

  select s.*
    into v_score
    from public.scores as s
   where s.student_id = v_student.id
     and s.game_id = p_game_id
   for update;

  if not found then
    insert into public.scores (student_id, game_id, score, created_at, updated_at)
    values (v_student.id, p_game_id, p_score, v_now, v_now)
    returning * into v_score;

    return query select
      'created'::text,
      null::integer,
      v_score.id,
      v_student.id,
      v_student.nickname,
      v_student.department_id,
      v_score.game_id,
      v_score.score,
      v_score.updated_at;
    return;
  end if;

  if p_score > v_score.score then
    result_previous_score := v_score.score;

    update public.scores
       set score = p_score,
           updated_at = v_now
     where id = v_score.id
    returning * into v_score;

    return query select
      'updated'::text,
      result_previous_score,
      v_score.id,
      v_student.id,
      v_student.nickname,
      v_student.department_id,
      v_score.game_id,
      v_score.score,
      v_score.updated_at;
    return;
  end if;

  return query select
    'kept'::text,
    v_score.score,
    v_score.id,
    v_student.id,
    v_student.nickname,
    v_student.department_id,
    v_score.game_id,
    v_score.score,
    v_score.updated_at;
end;
$$;

revoke all on function public.upsert_admin_score(text, text, text, text, integer) from public, anon, authenticated;
grant execute on function public.upsert_admin_score(text, text, text, text, integer) to service_role;
