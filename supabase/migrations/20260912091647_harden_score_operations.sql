alter table public.games
  add column if not exists ranking_mode text not null default 'individual';

do $$
begin
  if not exists (
    select 1
      from pg_constraint
     where conname = 'games_ranking_mode_check'
       and conrelid = 'public.games'::regclass
  ) then
    alter table public.games
      add constraint games_ranking_mode_check
      check (ranking_mode in ('individual', 'team'));
  end if;
end
$$;

update public.games
   set name = case id
     when 'flappy' then '기사님, 거기 주차 아니에요!'
     when 'reaction' then 'Counting Star~ 별 하나에 퍼어얼~'
     when 'dino-run' then '줄넘기, 너만 믿는다'
     when 'timing' then '내 뇌 아직 살아있다'
     when 'rhythm' then 'Flappy 세명: 날아라 세명!'
     else name
   end,
       description = case id
     when 'flappy' then '버스를 정확한 자리에 멈춰 세우는 주차 챌린지'
     when 'reaction' then '별을 세며 집중력을 겨루는 카운팅 게임'
     when 'dino-run' then '호흡을 맞춰 기록을 이어가는 줄넘기'
     when 'timing' then '순간 판단력을 겨루는 두뇌 게임'
     when 'rhythm' then '세 명의 병아리가 함께 날아가는 플래피 게임'
     else description
   end,
       ranking_mode = case
     when id in ('flappy', 'reaction', 'dino-run') then 'team'
     else 'individual'
   end,
       max_score = 9999
 where id in ('flappy', 'reaction', 'dino-run', 'timing', 'rhythm');

alter table public.scores
  add column if not exists team_name text,
  add column if not exists deleted_at timestamptz;

do $$
begin
  if not exists (
    select 1
      from pg_constraint
     where conname = 'scores_team_name_check'
       and conrelid = 'public.scores'::regclass
  ) then
    alter table public.scores
      add constraint scores_team_name_check
      check (
        team_name is null
        or (
          char_length(btrim(team_name)) between 2 and 12
          and team_name !~ '[<>[:cntrl:]]'
        )
      );
  end if;
end
$$;

update public.scores as sc
   set team_name = st.nickname
  from public.students as st
 where sc.student_id = st.id
   and sc.game_id in ('flappy', 'reaction', 'dino-run')
   and sc.team_name is null;

create index if not exists scores_active_game_score_idx
  on public.scores(game_id, score desc, updated_at asc)
  where deleted_at is null;

create table if not exists public.score_audit_log (
  id bigint generated always as identity primary key,
  score_id uuid references public.scores(id) on delete set null,
  action text not null check (action in ('create', 'update', 'delete', 'restore')),
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists score_audit_log_score_id_created_at_idx
  on public.score_audit_log(score_id, created_at desc);

alter table public.score_audit_log enable row level security;
revoke all on table public.score_audit_log from public, anon, authenticated;
grant select, insert on table public.score_audit_log to service_role;
grant usage, select on sequence public.score_audit_log_id_seq to service_role;

drop function if exists public.upsert_admin_score(text, text, text, text, integer);

create function public.upsert_admin_score(
  p_student_number text,
  p_game_id text,
  p_department_id text,
  p_nickname text,
  p_team_name text,
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
  v_before jsonb;
  v_max_score integer;
  v_ranking_mode text;
  v_now timestamptz := clock_timestamp();
  v_nickname text := btrim(p_nickname);
  v_team_name text := nullif(btrim(p_team_name), '');
  v_student_number text := btrim(p_student_number);
begin
  if v_student_number !~ '^[0-9]{6,12}$' then
    raise exception '학번은 숫자 6~12자리여야 합니다.' using errcode = '22023';
  end if;

  select g.max_score, g.ranking_mode
    into v_max_score, v_ranking_mode
    from public.games as g
   where g.id = p_game_id
     and g.is_active;

  if not found then
    raise exception '활성 게임을 찾을 수 없습니다.' using errcode = '22023';
  end if;

  if p_score is null or p_score < 0 or p_score > v_max_score then
    raise exception '점수는 0~% 정수여야 합니다.', v_max_score using errcode = '22023';
  end if;

  if char_length(v_nickname) < 2
     or char_length(v_nickname) > 12
     or v_nickname ~ '[<>[:cntrl:]]' then
    raise exception '닉네임은 특수 제어문자 없이 2~12자로 입력해주세요.' using errcode = '22023';
  end if;

  if v_ranking_mode = 'team' and (
    v_team_name is null
    or char_length(v_team_name) < 2
    or char_length(v_team_name) > 12
    or v_team_name ~ '[<>[:cntrl:]]'
  ) then
    raise exception '팀명은 특수 제어문자 없이 2~12자로 입력해주세요.' using errcode = '22023';
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
    insert into public.scores (
      student_id,
      game_id,
      score,
      team_name,
      created_at,
      updated_at
    ) values (
      v_student.id,
      p_game_id,
      p_score,
      case when v_ranking_mode = 'team' then v_team_name else null end,
      v_now,
      v_now
    )
    returning * into v_score;

    insert into public.score_audit_log(score_id, action, after_data)
    values (v_score.id, 'create', to_jsonb(v_score));

    result_status := 'created';
    result_previous_score := null;
  else
    v_before := to_jsonb(v_score);
    result_previous_score := v_score.score;

    if v_score.deleted_at is not null then
      update public.scores
         set score = p_score,
             team_name = case when v_ranking_mode = 'team' then v_team_name else null end,
             deleted_at = null,
             updated_at = v_now
       where id = v_score.id
      returning * into v_score;
      result_status := 'created';
      insert into public.score_audit_log(score_id, action, before_data, after_data)
      values (v_score.id, 'restore', v_before, to_jsonb(v_score));
    elsif p_score > v_score.score then
      update public.scores
         set score = p_score,
             team_name = case when v_ranking_mode = 'team' then v_team_name else null end,
             updated_at = v_now
       where id = v_score.id
      returning * into v_score;
      result_status := 'updated';
      insert into public.score_audit_log(score_id, action, before_data, after_data)
      values (v_score.id, 'update', v_before, to_jsonb(v_score));
    else
      if v_ranking_mode = 'team' and v_score.team_name is distinct from v_team_name then
        update public.scores
           set team_name = v_team_name,
               updated_at = v_now
         where id = v_score.id
        returning * into v_score;
        insert into public.score_audit_log(score_id, action, before_data, after_data)
        values (v_score.id, 'update', v_before, to_jsonb(v_score));
      end if;
      result_status := 'kept';
    end if;
  end if;

  return query select
    result_status,
    result_previous_score,
    v_score.id,
    v_student.id,
    coalesce(v_score.team_name, v_student.nickname),
    v_student.department_id,
    v_score.game_id,
    v_score.score,
    v_score.updated_at;
end;
$$;

revoke all on function public.upsert_admin_score(text, text, text, text, text, integer)
  from public, anon, authenticated;
grant execute on function public.upsert_admin_score(text, text, text, text, text, integer)
  to service_role;

drop function if exists public.update_admin_score(uuid, text, text, integer);

create function public.update_admin_score(
  p_score_id uuid,
  p_department_id text,
  p_display_name text,
  p_score integer
)
returns table (
  result_score_id uuid,
  result_student_id uuid,
  result_student_number text,
  result_student_nickname text,
  result_team_name text,
  result_display_name text,
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
  v_score public.scores%rowtype;
  v_student public.students%rowtype;
  v_before_score jsonb;
  v_max_score integer;
  v_ranking_mode text;
  v_display_name text := btrim(p_display_name);
  v_now timestamptz := clock_timestamp();
begin
  select s.*
    into v_score
    from public.scores as s
   where s.id = p_score_id
     and s.deleted_at is null
   for update;

  if not found then return; end if;
  v_before_score := to_jsonb(v_score);

  select g.max_score, g.ranking_mode
    into v_max_score, v_ranking_mode
    from public.games as g
   where g.id = v_score.game_id
     and g.is_active;

  if not found then return; end if;
  if p_score is null or p_score < 0 or p_score > v_max_score then
    raise exception '점수는 0~% 정수여야 합니다.', v_max_score using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.departments as d
     where d.id = p_department_id and d.is_active
  ) then
    raise exception '활성 학과를 선택해주세요.' using errcode = '22023';
  end if;
  if char_length(v_display_name) < 2
     or char_length(v_display_name) > 12
     or v_display_name ~ '[<>[:cntrl:]]' then
    raise exception '표시 이름은 특수 제어문자 없이 2~12자로 입력해주세요.' using errcode = '22023';
  end if;

  update public.students
     set department_id = p_department_id,
         nickname = case when v_ranking_mode = 'individual' then v_display_name else nickname end,
         updated_at = v_now
   where id = v_score.student_id
  returning * into v_student;

  update public.scores
     set score = p_score,
         team_name = case when v_ranking_mode = 'team' then v_display_name else null end,
         updated_at = v_now
   where id = v_score.id
  returning * into v_score;

  insert into public.score_audit_log(score_id, action, before_data, after_data)
  values (v_score.id, 'update', v_before_score, to_jsonb(v_score));

  return query select
    v_score.id,
    v_student.id,
    v_student.student_number,
    v_student.nickname,
    v_score.team_name,
    coalesce(v_score.team_name, v_student.nickname),
    v_student.department_id,
    v_score.game_id,
    v_score.score,
    v_score.updated_at;
end;
$$;

revoke all on function public.update_admin_score(uuid, text, text, integer)
  from public, anon, authenticated;
grant execute on function public.update_admin_score(uuid, text, text, integer)
  to service_role;

create or replace function public.delete_admin_score(p_score_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_before jsonb;
begin
  select to_jsonb(s)
    into v_before
    from public.scores as s
   where s.id = p_score_id
     and s.deleted_at is null
   for update;

  if not found then return false; end if;

  update public.scores
     set deleted_at = clock_timestamp(),
         updated_at = clock_timestamp()
   where id = p_score_id;

  insert into public.score_audit_log(score_id, action, before_data, after_data)
  select s.id, 'delete', v_before, to_jsonb(s)
    from public.scores as s
   where s.id = p_score_id;

  return true;
end;
$$;

revoke all on function public.delete_admin_score(uuid) from public, anon, authenticated;
grant execute on function public.delete_admin_score(uuid) to service_role;
