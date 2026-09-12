set lock_timeout = '5s';
set statement_timeout = '30s';

alter table public.departments
  drop constraint if exists departments_college_id_fkey;

drop index if exists public.departments_college_id_idx;

alter table public.departments
  drop column if exists college_id;

drop table if exists public.colleges;

insert into public.departments (id, name, slug, sort_order, is_active)
values
  ('life-business', '라이프경영학과', 'life-business', 1, true),
  ('life-welfare-counseling', '라이프복지상담학과', 'life-welfare-counseling', 2, true),
  ('bio-healthcare-convergence', '바이오헬스케어융합학과', 'bio-healthcare-convergence', 3, true)
on conflict (id) do update set
  name = excluded.name,
  slug = excluded.slug,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
