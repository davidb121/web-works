-- Web Works — Phase 1 schema
-- Run in the Supabase SQL editor (or `supabase db push`).

-- ---------- profiles ----------
create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  type text not null check (type in ('freelancer', 'client', 'both')),
  display_name text not null check (char_length(display_name) between 1 and 60),
  bio text default '' check (char_length(bio) <= 500),
  avatar_url text,
  company_logo_url text,
  website_url text,
  social_links jsonb not null default '{}',
  avg_rating numeric,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are publicly readable"
  on public.profiles for select using (true);

create policy "users insert own profile"
  on public.profiles for insert with check (auth.uid() = user_id);

create policy "users update own profile"
  on public.profiles for update using (auth.uid() = user_id);

-- ---------- listings ----------
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (user_id) on delete cascade,
  kind text not null check (kind in ('talent', 'project')),
  title text not null check (char_length(title) between 8 and 90),
  description text not null check (char_length(description) between 40 and 3000),
  engagement text check (engagement in ('one_time', 'ongoing')),
  budget_min integer check (budget_min >= 0),
  budget_max integer check (budget_max >= 0),
  skills text[] not null default '{}',
  contact_info text not null check (char_length(contact_info) between 5 and 200),
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'active', 'expired', 'removed')),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index listings_browse_idx on public.listings (status, kind, created_at desc);
create index listings_owner_idx on public.listings (owner_id);

alter table public.listings enable row level security;

-- Public can browse active ads, but contact_info is only exposed via the
-- reveal_contact() function below (grant column-level select to hide it).
create policy "active listings publicly readable"
  on public.listings for select
  using (status = 'active' or owner_id = auth.uid());

create policy "owners insert own listings"
  on public.listings for insert with check (auth.uid() = owner_id);

create policy "owners update own listings"
  on public.listings for update using (auth.uid() = owner_id);

-- Hide contact_info from direct selects (anon + authed); it is returned only
-- by reveal_contact(). Column-level privileges do this cleanly:
revoke select (contact_info) on public.listings from anon, authenticated;

-- ---------- subscriptions (mirrors Stripe; written only by edge functions) ----------
create table public.subscriptions (
  listing_id uuid primary key references public.listings (id) on delete cascade,
  stripe_subscription_id text unique,
  stripe_customer_id text,
  status text,
  promo_applied boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "owners read own subscriptions"
  on public.subscriptions for select
  using (exists (select 1 from public.listings l where l.id = listing_id and l.owner_id = auth.uid()));
-- No insert/update policies: only the service role (edge functions) writes here.

-- ---------- contact exchanges (gates reviews in Phase 2) ----------
create table public.contact_exchanges (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  requester_id uuid not null references public.profiles (user_id) on delete cascade,
  owner_id uuid not null references public.profiles (user_id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (listing_id, requester_id)
);

alter table public.contact_exchanges enable row level security;

create policy "parties read own exchanges"
  on public.contact_exchanges for select
  using (auth.uid() in (requester_id, owner_id));

-- ---------- promo counter (first 100 project listings at $2) ----------
create table public.promo_counter (
  id int primary key default 1 check (id = 1),
  promo_used int not null default 0,
  promo_cap int not null default 100
);
insert into public.promo_counter (id) values (1);

alter table public.promo_counter enable row level security;
-- readable via the function below only; no direct policies needed.

create or replace function public.promo_remaining()
returns int
language sql
security definer
set search_path = public
as $$
  select greatest(promo_cap - promo_used, 0) from public.promo_counter where id = 1;
$$;

-- Atomically claim a promo slot. Returns true if claimed. Called by the
-- create-checkout edge function (service role), not by clients.
create or replace function public.claim_promo_slot()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare claimed boolean := false;
begin
  update public.promo_counter
     set promo_used = promo_used + 1
   where id = 1 and promo_used < promo_cap;
  claimed := found;
  return claimed;
end;
$$;

revoke execute on function public.claim_promo_slot() from anon, authenticated;

-- ---------- reveal contact ----------
create or replace function public.reveal_contact(p_listing_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contact text;
  v_owner uuid;
  v_recent int;
begin
  if auth.uid() is null then
    raise exception 'Sign in to see contact info.';
  end if;

  select contact_info, owner_id into v_contact, v_owner
    from public.listings
   where id = p_listing_id and status = 'active';

  if v_contact is null then
    raise exception 'Listing not found or not active.';
  end if;

  -- basic rate limit: max 20 reveals per day per user
  select count(*) into v_recent
    from public.contact_exchanges
   where requester_id = auth.uid() and created_at > now() - interval '1 day';
  if v_recent >= 20 then
    raise exception 'Daily contact limit reached. Try again tomorrow.';
  end if;

  insert into public.contact_exchanges (listing_id, requester_id, owner_id)
  values (p_listing_id, auth.uid(), v_owner)
  on conflict (listing_id, requester_id) do nothing;

  return v_contact;
end;
$$;

-- ---------- storage bucket for avatars/logos ----------
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

create policy "avatar images publicly readable"
  on storage.objects for select using (bucket_id = 'avatars');

create policy "users upload to own folder"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "users update own files"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
