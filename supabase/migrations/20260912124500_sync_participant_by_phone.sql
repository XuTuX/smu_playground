create or replace function public.upsert_admin_score_v3(
  p_phone text,
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
  v_phone text := nullif(regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g'), '');
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

  if v_phone is null or v_phone !~ '^01[016789][0-9]{7,8}$' then
    raise exception '전화번호를 숫자 10~11자리로 입력해주세요.' using errcode = '22023';
  end if;

  if p_score is null or p_score < 0 or p_score > v_max_score then
    raise exception '점수는 0~% 정수여야 합니다.', v_max_score using errcode = '22023';
  end if;

  if v_ranking_mode = 'individual' then
    if v_nickname is null
       or char_length(v_nickname) < 2
       or char_length(v_nickname) > 12
       or v_nickname ~ '[<>[:cntrl:]]' then
      raise exception '닉네임은 2~12자로 입력해주세요.' using errcode = '22023';
    end if;

    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('individual:' || v_phone || ':' || p_game_id, 0)
    );

    select st.* into v_student
      from public.students as st
     where st.phone_number = v_phone
     for update;

    if not found then
      insert into public.students (
        phone_number, department_id, nickname, created_at, updated_at
      ) values (
        v_phone, p_department_id, v_nickname, v_now, v_now
      ) returning * into v_student;
    else
      update public.students
         set department_id = p_department_id,
             nickname = v_nickname,
             updated_at = v_now
       where id = v_student.id
       returning * into v_student;
    end if;

    -- Synchronize existing teams sharing the same representative phone
    update public.teams
       set team_name = v_nickname,
           department_id = p_department_id,
           updated_at = v_now
     where representative_phone = v_phone;

    update public.scores
       set team_name = v_nickname
     where team_id in (select id from public.teams where representative_phone = v_phone)
       and team_name is distinct from v_nickname;

    v_participant_id := v_student.id;
    v_display_name := v_student.nickname;
    v_department_id := v_student.department_id;

    select sc.* into v_score
      from public.scores as sc
     where sc.student_id = v_student.id and sc.game_id = p_game_id
     order by (sc.deleted_at is null) desc, sc.updated_at desc
     limit 1
     for update;
  else
    if v_team_name is null
       or char_length(v_team_name) < 2
       or char_length(v_team_name) > 12
       or v_team_name ~ '[<>[:cntrl:]]' then
      raise exception '팀명은 2~12자로 입력해주세요.' using errcode = '22023';
    end if;

    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('team:' || v_phone || ':' || p_game_id, 0)
    );

    select tm.* into v_team
      from public.teams as tm
     where tm.representative_phone = v_phone
        or (
          tm.representative_phone is null
          and tm.normalized_name = lower(v_team_name)
        )
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

    -- Synchronize existing student record sharing the same phone
    update public.students
       set nickname = v_team_name,
           department_id = p_department_id,
           updated_at = v_now
     where phone_number = v_phone;

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
    if v_ranking_mode = 'individual' then
      insert into public.scores (
        student_id, game_id, score, team_name, created_at, updated_at, deleted_at
      ) values (
        v_participant_id, p_game_id, p_score, null, v_now, v_now, null
      ) returning * into v_score;
    else
      insert into public.scores (
        team_id, game_id, score, team_name, created_at, updated_at, deleted_at
      ) values (
        v_participant_id, p_game_id, p_score, v_display_name, v_now, v_now, null
      ) returning * into v_score;
    end if;

    insert into public.score_audit_log (
      score_id, action, before_data, after_data, created_at
    ) values (
      v_score.id,
      'create',
      null,
      to_jsonb(v_score),
      v_now
    );

    return query
    select
      'created'::text,
      null::integer,
      v_score.id,
      v_participant_id,
      v_display_name,
      v_department_id,
      v_score.game_id,
      v_score.score,
      v_score.updated_at;
    return;
  end if;

  v_before := to_jsonb(v_score);

  if v_score.deleted_at is not null then
    update public.scores
       set score = p_score,
           team_name = case when v_ranking_mode = 'team' then v_display_name else null end,
           deleted_at = null,
           updated_at = v_now
     where id = v_score.id
     returning * into v_score;

    insert into public.score_audit_log (
      score_id, action, before_data, after_data, created_at
    ) values (
      v_score.id,
      'restore',
      v_before,
      to_jsonb(v_score),
      v_now
    );

    return query
    select
      'updated'::text,
      (v_before->>'score')::integer,
      v_score.id,
      v_participant_id,
      v_display_name,
      v_department_id,
      v_score.game_id,
      v_score.score,
      v_score.updated_at;
    return;
  end if;

  if p_score > v_score.score then
    update public.scores
       set score = p_score,
           team_name = case when v_ranking_mode = 'team' then v_display_name else null end,
           updated_at = v_now
     where id = v_score.id
     returning * into v_score;

    insert into public.score_audit_log (
      score_id, action, before_data, after_data, created_at
    ) values (
      v_score.id,
      'update',
      v_before,
      to_jsonb(v_score),
      v_now
    );

    return query
    select
      'updated'::text,
      (v_before->>'score')::integer,
      v_score.id,
      v_participant_id,
      v_display_name,
      v_department_id,
      v_score.game_id,
      v_score.score,
      v_score.updated_at;
    return;
  end if;

  return query
  select
    'kept'::text,
    v_score.score,
    v_score.id,
    v_participant_id,
    v_display_name,
    v_department_id,
    v_score.game_id,
    v_score.score,
    v_score.updated_at;
end;
$$;
