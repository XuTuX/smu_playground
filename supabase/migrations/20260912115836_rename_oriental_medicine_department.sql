insert into public.departments (
  id,
  college_id,
  name,
  slug,
  sort_order,
  is_active
)
values (
  'oriental-medicine-major',
  'oriental-medicine',
  '한의학과',
  'oriental-medicine-major',
  1,
  true
)
on conflict (id) do update
set name = excluded.name;
