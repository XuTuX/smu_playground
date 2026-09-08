update public.games
   set max_score = 9999
 where id in ('flappy', 'reaction', 'dino-run', 'timing', 'rhythm');

create or replace function public.update_admin_score(
  p_score_id uuid,
  p_department_id text,
  p_nickname text,
  p_score integer
)
returns table (
  result_score_id uuid,
  result_student_id uuid,
  result_student_number text,
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
  v_score public.scores%rowtype;
  v_student public.students%rowtype;
  v_max_score integer;
  v_nickname text := btrim(p_nickname);
  v_now timestamptz := clock_timestamp();
begin
  select s.*
    into v_score
    from public.scores as s
   where s.id = p_score_id
   for update;

  if not found then
    return;
  end if;

  select g.max_score
    into v_max_score
    from public.games as g
   where g.id = v_score.game_id
     and g.is_active;

  if not found then
    return;
  end if;

  if p_score is null or p_score < 0 or p_score > v_max_score then
    raise exception '점수는 0~% 정수여야 합니다.', v_max_score using errcode = '22023';
  end if;

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

  update public.students
     set department_id = p_department_id,
         nickname = v_nickname,
         updated_at = v_now
   where id = v_score.student_id
  returning * into v_student;

  update public.scores
     set score = p_score,
         updated_at = v_now
   where id = v_score.id
  returning * into v_score;

  return query select
    v_score.id,
    v_student.id,
    v_student.student_number,
    v_student.nickname,
    v_student.department_id,
    v_score.game_id,
    v_score.score,
    v_score.updated_at;
end;
$$;

create or replace function public.delete_admin_score(p_score_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  delete from public.scores where id = p_score_id;
  return found;
end;
$$;

revoke all on function public.update_admin_score(uuid, text, text, integer) from public, anon, authenticated;
grant execute on function public.update_admin_score(uuid, text, text, integer) to service_role;

revoke all on function public.delete_admin_score(uuid) from public, anon, authenticated;
grant execute on function public.delete_admin_score(uuid) to service_role;
