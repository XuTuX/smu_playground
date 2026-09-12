update public.games
   set name = case id
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
   end
 where id in ('flappy', 'reaction', 'dino-run', 'timing', 'rhythm');
