-- Migration to update game IDs and slugs to:
-- dino-run -> rope (GAME 03, 줄넘기 챌린지, team)
-- flappy -> parking (GAME 01, 주차왕 대작전, team)
-- reaction -> star (GAME 02, 별별 협동작전, team)
-- rhythm -> jump (GAME 05, 직선점프, individual)
-- timing -> memory (GAME 04, 신호등 암기, individual)

do $$
begin
  -- 1. Update existing game records (cascades to scores.game_id)
  update public.games
     set id = case id
           when 'flappy' then 'parking'
           when 'reaction' then 'star'
           when 'dino-run' then 'rope'
           when 'timing' then 'memory'
           when 'rhythm' then 'jump'
           else id
         end,
         slug = case slug
           when 'flappy' then 'parking'
           when 'reaction' then 'star'
           when 'dino-run' then 'rope'
           when 'timing' then 'memory'
           when 'rhythm' then 'jump'
           else slug
         end,
         name = case id
           when 'flappy' then '주차왕 대작전'
           when 'reaction' then '별별 협동작전'
           when 'dino-run' then '줄넘기 챌린지'
           when 'timing' then '신호등 암기'
           when 'rhythm' then '직선점프'
           else name
         end,
         description = case id
           when 'flappy' then '차량을 정확한 자리에 멈춰 세우는 주차 챌린지'
           when 'reaction' then '별을 세며 집중력을 겨루는 카운팅 게임'
           when 'dino-run' then '호흡을 맞춰 기록을 이어가는 줄넘기'
           when 'timing' then '순간 판단력을 겨루는 두뇌 게임'
           when 'rhythm' then '타이밍에 맞춰 장애물을 뛰어넘는 점프 게임'
           else description
         end,
         ranking_mode = case
           when id in ('flappy', 'reaction', 'dino-run', 'parking', 'star', 'rope') then 'team'
           else 'individual'
         end,
         max_score = 9999
   where id in ('flappy', 'reaction', 'dino-run', 'timing', 'rhythm');

  -- 2. Insert any missing game records
  insert into public.games (id, slug, code, name, description, accent, max_score, is_active, ranking_mode)
  values
    ('parking', 'parking', 'GAME 01', '주차왕 대작전', '차량을 정확한 자리에 멈춰 세우는 주차 챌린지', 'yellow', 9999, true, 'team'),
    ('star', 'star', 'GAME 02', '별별 협동작전', '별을 세며 집중력을 겨루는 카운팅 게임', 'pink', 9999, true, 'team'),
    ('rope', 'rope', 'GAME 03', '줄넘기 챌린지', '호흡을 맞춰 기록을 이어가는 줄넘기', 'sky', 9999, true, 'team'),
    ('memory', 'memory', 'GAME 04', '신호등 암기', '순간 판단력을 겨루는 두뇌 게임', 'mint', 9999, true, 'individual'),
    ('jump', 'jump', 'GAME 05', '직선점프', '타이밍에 맞춰 장애물을 뛰어넘는 점프 게임', 'orange', 9999, true, 'individual')
  on conflict (id) do update set
    slug = excluded.slug,
    code = excluded.code,
    name = excluded.name,
    description = excluded.description,
    accent = excluded.accent,
    max_score = excluded.max_score,
    is_active = excluded.is_active,
    ranking_mode = excluded.ranking_mode;
end
$$;
