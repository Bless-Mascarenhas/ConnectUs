-- Run in Supabase → SQL Editor after Phase 2 deploy.
-- Creates a public."User" row when someone signs up via Supabase Auth.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
begin
  display_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    split_part(new.email, '@', 1)
  );

  insert into public."User" (id, name, avatar, role, major, "gradYear", university, bio, stats)
  values (
    new.id::text,
    display_name,
    'https://api.dicebear.com/7.x/notionists/svg?seed=' || replace(display_name, ' ', '%20') || '&backgroundColor=transparent&radius=50',
    'student',
    '',
    extract(year from now())::int + 1,
    '',
    '',
    '{"connections":0,"pending":0,"events":0,"unread":0}'::jsonb
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
