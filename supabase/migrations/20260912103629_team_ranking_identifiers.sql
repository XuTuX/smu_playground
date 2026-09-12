create table public.teams (
  id uuid primary key default gen_random_uuid(),
  team_name text not null check (
    char_length(btrim(team_name)) between 2 and 12
    and team_name !~ '[<>[:cntrl:]]'
  ),
  normalized_name text generated always as (lower(btrim(team_name))) stored,
  representative_phone text check (
    representative_phone is null
    or representative_phone ~ '^01[016789][0-9]{7,8}$'
  ),
  department_id text not null references public.departments(id) on update cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (normalized_name),
  unique (representative_phone)
);

create index teams_department_id_idx on public.teams(department_id);

alter table public.teams enable row level security;
revoke all on table public.teams from public, anon, authenticated;
grant select, insert, update, delete on table public.teams to service_role;

alter table public.scores
  alter column student_id drop not null,
  add column team_id uuid references public.teams(id) on delete cascade;

-- Preserve any team records registered by the previous 학번-based admin form.
insert into public.teams (team_name, department_id, created_at, updated_at)
select distinct on (lower(btrim(sc.team_name)))
  btrim(sc.team_name),
  st.department_id,
  sc.created_at,
  sc.updated_at
from public.scores as sc
join public.students as st on st.id = sc.student_id
join public.games as g on g.id = sc.game_id and g.ranking_mode = 'team'
where sc.team_name is not null
order by lower(btrim(sc.team_name)), sc.updated_at desc
on conflict (normalized_name) do nothing;

update public.scores as sc
set team_id = tm.id,
    student_id = null,
    team_name = tm.team_name
from public.teams as tm, public.games as g
where g.id = sc.game_id
  and g.ranking_mode = 'team'
  and sc.team_name is not null
  and tm.normalized_name = lower(btrim(sc.team_name));

alter table public.scores
  add constraint scores_exactly_one_participant_check
  check (num_nonnulls(student_id, team_id) = 1) not valid;

alter table public.scores validate constraint scores_exactly_one_participant_check;

create index scores_team_id_idx on public.scores(team_id) where team_id is not null;
create unique index scores_active_team_game_key
  on public.scores(team_id, game_id)
  where team_id is not null and deleted_at is null;

create function public.upsert_admin_score_v2(
  p_student_number text,
  p_representative_phone text,
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
  result_participant_id uuid,
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
  v_team public.teams%rowtype;
  v_score public.scores%rowtype;
  v_before jsonb;
  v_max_score integer;
  v_ranking_mode text;
  v_now timestamptz := clock_timestamp();
  v_student_number text := nullif(btrim(p_student_number), '');
  v_phone text := nullif(regexp_replace(coalesce(p_representative_phone, ''), '[^0-9]', '', 'g'), '');
  v_nickname text := nullif(btrim(p_nickname), '');
  v_team_name text := nullif(btrim(p_team_name), '');
  v_participant_id uuid;
  v_display_name text;
  v_department_id text;
begin
  select g.max_score, g.ranking_mode
    into v_max_score, v_ranking_mode
    from public.games as g
   where g.id = p_game_id and g.is_active;

  if not found then
    raise exception '활성 게임을 찾을 수 없습니다.' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.departments as d
    where d.id = p_department_id and d.is_active
  ) then
    raise exception '활성 학과를 선택해주세요.' using errcode = '22023';
  end if;

  if p_score is null or p_score < 0 or p_score > v_max_score then
    raise exception '점수는 0~% 정수여야 합니다.', v_max_score using errcode = '22023';
  end if;

  if v_ranking_mode = 'individual' then
    if v_student_number is null or v_student_number !~ '^[0-9]{6,12}$' then
      raise exception '학번은 숫자 6~12자리여야 합니다.' using errcode = '22023';
    end if;
    if v_nickname is null
       or char_length(v_nickname) < 2
       or char_length(v_nickname) > 12
       or v_nickname ~ '[<>[:cntrl:]]' then
      raise exception '닉네임은 2~12자로 입력해주세요.' using errcode = '22023';
    end if;

    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('student:' || v_student_number || ':' || p_game_id, 0)
    );

    select st.* into v_student
      from public.students as st
     where st.student_number = v_student_number
     for update;

    if not found then
      insert into public.students (
        student_number, department_id, nickname, created_at, updated_at
      ) values (
        v_student_number, p_department_id, v_nickname, v_now, v_now
      ) returning * into v_student;
    else
      update public.students
         set department_id = p_department_id,
             nickname = v_nickname,
             updated_at = v_now
       where id = v_student.id
       returning * into v_student;
    end if;

    v_participant_id := v_student.id;
    v_display_name := v_student.nickname;
    v_department_id := v_student.department_id;

    select sc.* into v_score
      from public.scores as sc
     where sc.student_id = v_student.id and sc.game_id = p_game_id
     for update;
  else
    if v_phone is null or v_phone !~ '^01[016789][0-9]{7,8}$' then
      raise exception '대표자 전화번호를 숫자 10~11자리로 입력해주세요.' using errcode = '22023';
    end if;
    if v_team_name is null
       or char_length(v_team_name) < 2
       or char_length(v_team_name) > 12
       or v_team_name ~ '[<>[:cntrl:]]' then
      raise exception '팀명은 2~12자로 입력해주세요.' using errcode = '22023';
    end if;

    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('team:' || v_phone || ':' || lower(v_team_name), 0)
    );

    select tm.* into v_team
      from public.teams as tm
     where tm.representative_phone = v_phone
        or tm.normalized_name = lower(v_team_name)
     order by (tm.representative_phone = v_phone) desc
     limit 1
     for update;

    if not found then
      insert into public.teams (
        team_name, representative_phone, department_id, created_at, updated_at
      ) values (
        v_team_name, v_phone, p_department_id, v_now, v_now
      ) returning * into v_team;
    else
      update public.teams
         set team_name = v_team_name,
             representative_phone = v_phone,
             department_id = p_department_id,
             updated_at = v_now
       where id = v_team.id
       returning * into v_team;
    end if;

    update public.scores
       set team_name = v_team.team_name
     where team_id = v_team.id
       and team_name is distinct from v_team.team_name;

    v_participant_id := v_team.id;
    v_display_name := v_team.team_name;
    v_department_id := v_team.department_id;

    select sc.* into v_score
      from public.scores as sc
     where sc.team_id = v_team.id and sc.game_id = p_game_id
     order by (sc.deleted_at is null) desc, sc.updated_at desc
     limit 1
     for update;
  end if;

  if not found then
    insert into public.scores (
      student_id, team_id, game_id, score, team_name, created_at, updated_at
    ) values (
      case when v_ranking_mode = 'individual' then v_student.id else null end,
      case when v_ranking_mode = 'team' then v_team.id else null end,
      p_game_id,
      p_score,
      case when v_ranking_mode = 'team' then v_team.team_name else null end,
      v_now,
      v_now
    ) returning * into v_score;
    result_status := 'created';
    result_previous_score := null;
    insert into public.score_audit_log(score_id, action, after_data)
    values (v_score.id, 'create', to_jsonb(v_score));
  else
    v_before := to_jsonb(v_score);
    result_previous_score := v_score.score;
    if v_score.deleted_at is not null then
      update public.scores
         set score = p_score, deleted_at = null, updated_at = v_now
       where id = v_score.id
       returning * into v_score;
      result_status := 'created';
      insert into public.score_audit_log(score_id, action, before_data, after_data)
      values (v_score.id, 'restore', v_before, to_jsonb(v_score));
    elsif p_score > v_score.score then
      update public.scores
         set score = p_score, updated_at = v_now
       where id = v_score.id
       returning * into v_score;
      result_status := 'updated';
      insert into public.score_audit_log(score_id, action, before_data, after_data)
      values (v_score.id, 'update', v_before, to_jsonb(v_score));
    else
      result_status := 'kept';
    end if;
  end if;

  return query select
    result_status,
    result_previous_score,
    v_score.id,
    v_participant_id,
    v_display_name,
    v_department_id,
    v_score.game_id,
    v_score.score,
    v_score.updated_at;
end;
$$;

revoke all on function public.upsert_admin_score_v2(text, text, text, text, text, text, integer)
  from public, anon, authenticated;
grant execute on function public.upsert_admin_score_v2(text, text, text, text, text, text, integer)
  to service_role;

create function public.update_admin_score_v2(
  p_score_id uuid,
  p_department_id text,
  p_display_name text,
  p_score integer
)
returns table (
  result_score_id uuid,
  result_participant_id uuid,
  result_participant_kind text,
  result_student_number text,
  result_student_nickname text,
  result_representative_phone text,
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
  v_team public.teams%rowtype;
  v_before jsonb;
  v_max_score integer;
  v_name text := btrim(p_display_name);
  v_now timestamptz := clock_timestamp();
begin
  select sc.* into v_score
    from public.scores as sc
   where sc.id = p_score_id and sc.deleted_at is null
   for update;
  if not found then return; end if;

  select g.max_score into v_max_score
    from public.games as g where g.id = v_score.game_id and g.is_active;
  if not found or p_score is null or p_score < 0 or p_score > v_max_score then
    raise exception '점수 범위를 확인해주세요.' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.departments as d
    where d.id = p_department_id and d.is_active
  ) then
    raise exception '활성 학과를 선택해주세요.' using errcode = '22023';
  end if;
  if char_length(v_name) < 2 or char_length(v_name) > 12 or v_name ~ '[<>[:cntrl:]]' then
    raise exception '이름은 2~12자로 입력해주세요.' using errcode = '22023';
  end if;

  v_before := to_jsonb(v_score);
  if v_score.team_id is not null then
    update public.teams
       set team_name = v_name,
           department_id = p_department_id,
           updated_at = v_now
     where id = v_score.team_id
     returning * into v_team;
    update public.scores
       set team_name = v_team.team_name
     where team_id = v_team.id;
  else
    update public.students
       set nickname = v_name,
           department_id = p_department_id,
           updated_at = v_now
     where id = v_score.student_id
     returning * into v_student;
  end if;

  update public.scores
     set score = p_score, updated_at = v_now
   where id = v_score.id
   returning * into v_score;

  insert into public.score_audit_log(score_id, action, before_data, after_data)
  values (v_score.id, 'update', v_before, to_jsonb(v_score));

  return query select
    v_score.id,
    coalesce(v_score.team_id, v_score.student_id),
    case when v_score.team_id is not null then 'team' else 'individual' end,
    v_student.student_number,
    v_student.nickname,
    v_team.representative_phone,
    v_team.team_name,
    coalesce(v_team.team_name, v_student.nickname),
    coalesce(v_team.department_id, v_student.department_id),
    v_score.game_id,
    v_score.score,
    v_score.updated_at;
end;
$$;

revoke all on function public.update_admin_score_v2(uuid, text, text, integer)
  from public, anon, authenticated;
grant execute on function public.update_admin_score_v2(uuid, text, text, integer)
  to service_role;
