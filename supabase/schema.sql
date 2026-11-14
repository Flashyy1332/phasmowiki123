-- PhasmoWiki: схема бази даних (Supabase / PostgreSQL)
-- Виконайте цей файл у Supabase -> SQL Editor. Його безпечно запускати повторно.

create table if not exists public.ghosts (
  name            text primary key,
  hunt_threshold  text not null default '',
  evidences       text not null default '',   -- докази через кому
  description     text not null default '',
  strength        text not null default '',
  weakness        text not null default '',
  test            text not null default ''
);

create table if not exists public.equipment (
  name         text primary key,
  icon         text not null default '',
  image_url    text not null default '',      -- назва файлу з public/items або повний URL
  description  text not null default ''
);

create table if not exists public.admins (
  email text primary key
);

-- Row Level Security: довідник може читати будь-хто, змінювати — лише сервер
-- (secret key обходить RLS). Список адміністраторів закритий повністю.
alter table public.ghosts    enable row level security;
alter table public.equipment enable row level security;
alter table public.admins    enable row level security;

drop policy if exists "ghosts are public" on public.ghosts;
create policy "ghosts are public" on public.ghosts for select using (true);

drop policy if exists "equipment is public" on public.equipment;
create policy "equipment is public" on public.equipment for select using (true);

-- Додайте себе адміністратором (email вашого Google-акаунта):
-- insert into public.admins (email) values ('you@gmail.com') on conflict do nothing;
