-- Albatany v5 / run once in Supabase SQL Editor as project owner.
-- No email, avatar or provider token is copied into community tables.
-- private is deliberately NOT an exposed PostgREST schema.
begin;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.community_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  alias text not null check (char_length(alias) between 2 and 24),
  updated_at timestamptz not null default now()
);
create table if not exists private.projects (
  id text primary key check (id ~ '^[a-z0-9-]{1,80}$')
);
insert into private.projects(id) values
 ('memory-loop'),('programming-pathways'),('zt-hac'),('bridge'),('offlinebox'),
 ('chronolens'),('vaultkeep'),('hmif'),('credro'),('tromutz') on conflict do nothing;
create table if not exists private.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 3 and 500),
  created_at timestamptz not null default clock_timestamp(),
  hidden boolean not null default false
);
create table if not exists private.project_reactions (
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id text not null references private.projects(id) on delete cascade,
  kind text not null check (kind in ('heart','fire','clap')),
  updated_at timestamptz not null default clock_timestamp(),
  primary key(user_id,project_id)
);
-- Rate state survives deleting public contributions, so deletion cannot reset cooldown.
create table if not exists private.community_rate_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  last_post_at timestamptz,
  post_day date,
  post_count integer not null default 0,
  last_reaction_at timestamptz
);
create index if not exists guestbook_recent on private.guestbook_entries(created_at desc);
create index if not exists reactions_project on private.project_reactions(project_id,kind);
alter table private.community_profiles enable row level security;
alter table private.projects enable row level security;
alter table private.guestbook_entries enable row level security;
alter table private.project_reactions enable row level security;
alter table private.community_rate_limits enable row level security;
revoke all on all tables in schema private from public,anon,authenticated;
-- No direct table grants/policies. The narrowly scoped RPCs below perform ownership checks.

create or replace function public.my_community_profile()
returns table(alias text) language sql stable security definer set search_path = '' as $$
 select p.alias from private.community_profiles p where p.user_id=auth.uid();
$$;
create or replace function public.set_community_alias(p_alias text)
returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); cleaned text := btrim(p_alias);
begin
 if uid is null then raise exception 'AUTH_REQUIRED'; end if;
 if cleaned is null or char_length(cleaned) not between 2 and 24 or cleaned !~ '^[[:alnum:] ._-]+$' then raise exception 'INVALID_ALIAS'; end if;
 insert into private.community_profiles(user_id,alias) values(uid,cleaned)
 on conflict(user_id) do update set alias=excluded.alias,updated_at=now();
end; $$;

create or replace function public.list_guestbook_entries(p_before timestamptz default null,p_limit integer default 20)
returns table(id uuid,alias text,body text,created_at timestamptz,is_owner boolean)
language sql stable security definer set search_path = '' as $$
 select e.id,p.alias,e.body,e.created_at,coalesce(e.user_id=auth.uid(),false)
 from private.guestbook_entries e join private.community_profiles p on p.user_id=e.user_id
 where not e.hidden and (p_before is null or e.created_at<p_before)
 order by e.created_at desc,e.id desc limit greatest(1,least(coalesce(p_limit,20),50));
$$;
create or replace function public.add_guestbook_entry(p_body text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); entry_id uuid; r private.community_rate_limits; cleaned text := btrim(p_body);
begin
 if uid is null then raise exception 'AUTH_REQUIRED'; end if;
 if cleaned is null or char_length(cleaned) not between 3 and 500 then raise exception 'INVALID_MESSAGE'; end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 if not exists(select 1 from private.community_profiles p where p.user_id=uid) then raise exception 'ALIAS_REQUIRED'; end if;
 insert into private.community_rate_limits(user_id) values(uid) on conflict do nothing;
 select * into r from private.community_rate_limits where user_id=uid for update;
 if r.last_post_at > now()-interval '45 seconds' or (r.post_day=current_date and r.post_count>=10) then raise exception 'RATE_LIMIT'; end if;
 insert into private.guestbook_entries(user_id,body) values(uid,cleaned) returning id into entry_id;
 update private.community_rate_limits set last_post_at=now(),post_count=case when post_day=current_date then post_count+1 else 1 end,post_day=current_date where user_id=uid;
 return entry_id;
end; $$;
create or replace function public.delete_guestbook_entry(p_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
 if auth.uid() is null then raise exception 'AUTH_REQUIRED'; end if;
 delete from private.guestbook_entries where id=p_id and user_id=auth.uid();
end; $$;

create or replace function public.project_reaction_counts()
returns table(project_id text,kind text,total bigint,is_mine boolean)
language sql stable security definer set search_path = '' as $$
 select r.project_id,r.kind,count(*),coalesce(bool_or(r.user_id=auth.uid()),false)
 from private.project_reactions r group by r.project_id,r.kind;
$$;
create or replace function public.toggle_project_reaction(p_project_id text,p_kind text)
returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); previous text; last_time timestamptz;
begin
 if uid is null then raise exception 'AUTH_REQUIRED'; end if;
 if p_kind is null or p_kind not in ('heart','fire','clap') or not exists(select 1 from private.projects p where p.id=p_project_id) then raise exception 'INVALID_REACTION'; end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 insert into private.community_rate_limits(user_id) values(uid) on conflict do nothing;
 select last_reaction_at into last_time from private.community_rate_limits where user_id=uid for update;
 if last_time > clock_timestamp()-interval '700 milliseconds' then raise exception 'RATE_LIMIT'; end if;
 select kind into previous from private.project_reactions where user_id=uid and project_id=p_project_id;
 if previous=p_kind then delete from private.project_reactions where user_id=uid and project_id=p_project_id;
 else insert into private.project_reactions(user_id,project_id,kind) values(uid,p_project_id,p_kind)
 on conflict(user_id,project_id) do update set kind=excluded.kind,updated_at=clock_timestamp(); end if;
 update private.community_rate_limits set last_reaction_at=clock_timestamp() where user_id=uid;
end; $$;

create or replace function public.delete_my_community_data()
returns void language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid();
begin
 if uid is null then raise exception 'AUTH_REQUIRED'; end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 delete from private.guestbook_entries where user_id=uid;
 delete from private.project_reactions where user_id=uid;
 delete from private.community_profiles where user_id=uid;
 -- Abuse-limiting timestamps/counts remain; no message or alias is retained here.
end; $$;

revoke execute on function public.my_community_profile() from public,anon;
revoke execute on function public.set_community_alias(text) from public,anon;
revoke execute on function public.add_guestbook_entry(text) from public,anon;
revoke execute on function public.delete_guestbook_entry(uuid) from public,anon;
revoke execute on function public.toggle_project_reaction(text,text) from public,anon;
revoke execute on function public.delete_my_community_data() from public,anon;
revoke execute on function public.list_guestbook_entries(timestamptz,integer) from public;
revoke execute on function public.project_reaction_counts() from public;
grant execute on function public.my_community_profile() to authenticated;
grant execute on function public.set_community_alias(text) to authenticated;
grant execute on function public.add_guestbook_entry(text) to authenticated;
grant execute on function public.delete_guestbook_entry(uuid) to authenticated;
grant execute on function public.toggle_project_reaction(text,text) to authenticated;
grant execute on function public.delete_my_community_data() to authenticated;
grant execute on function public.list_guestbook_entries(timestamptz,integer) to anon,authenticated;
grant execute on function public.project_reaction_counts() to anon,authenticated;
commit;
