-- Web Works — migration 003: Phase 2 trust layer
-- Reviews with mutual confirmation, verification, badges, ratings, reports, admin.
-- Run after 002.

-- ---------- admin flag ----------
alter table public.profiles
  add column is_admin boolean not null default false,
  add column review_count int not null default 0;

-- The founding account becomes the first admin (only profile at migration time).
update public.profiles set is_admin = true;

-- ---------- reviews ----------
-- The author's submission counts as their confirmation; the subject must
-- confirm the working relationship (14-day timeout -> posts as one_party).
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (user_id) on delete cascade,
  subject_id uuid not null references public.profiles (user_id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text not null check (char_length(body) between 20 and 2000),
  work_url text,
  status text not null default 'pending_confirmation'
    check (status in ('pending_confirmation', 'pending_verification', 'live', 'rejected')),
  badge text check (badge in ('mutual_link', 'mutual', 'one_party')),
  subject_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  check (author_id <> subject_id),
  unique (author_id, subject_id, listing_id)
);

create index reviews_subject_idx on public.reviews (subject_id, status);
create index reviews_pending_idx on public.reviews (status, created_at);

alter table public.reviews enable row level security;

create policy "live reviews publicly readable"
  on public.reviews for select
  using (status = 'live' or auth.uid() in (author_id, subject_id));

-- Insert allowed only when a contact exchange links the two parties on this listing.
create policy "authors insert eligible reviews"
  on public.reviews for insert
  with check (
    auth.uid() = author_id
    and author_id <> subject_id
    and exists (
      select 1 from public.contact_exchanges ce
      where ce.listing_id = reviews.listing_id
        and ((ce.requester_id = reviews.author_id and ce.owner_id = reviews.subject_id)
          or (ce.requester_id = reviews.subject_id and ce.owner_id = reviews.author_id))
    )
  );
-- No user update/delete policies: state changes flow through the functions below.

-- ---------- verification results ----------
create table public.verification_results (
  review_id uuid primary key references public.reviews (id) on delete cascade,
  url_live boolean,
  matches_description boolean,
  ai_summary text,
  checked_at timestamptz not null default now()
);

alter table public.verification_results enable row level security;

create policy "verification results readable with their review"
  on public.verification_results for select
  using (exists (
    select 1 from public.reviews r
    where r.id = review_id and (r.status = 'live' or auth.uid() in (r.author_id, r.subject_id))
  ));
-- Written only by the service role (verify-review edge function).

-- ---------- reports ----------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (user_id) on delete cascade,
  target_type text not null check (target_type in ('listing', 'profile', 'review')),
  target_id uuid not null,
  reason text not null check (char_length(reason) between 10 and 1000),
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy "signed-in users file reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

create policy "admins read reports"
  on public.reports for select
  using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.is_admin));

-- ---------- rating rollup (badge-weighted) ----------
create or replace function public.recompute_rating(p_user uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles set
    avg_rating = (
      select round(sum(r.rating * w.weight) / nullif(sum(w.weight), 0), 2)
      from public.reviews r
      cross join lateral (select case r.badge
        when 'mutual_link' then 1.0
        when 'mutual' then 0.8
        else 0.4 end as weight) w
      where r.subject_id = p_user and r.status = 'live'
    ),
    review_count = (select count(*) from public.reviews where subject_id = p_user and status = 'live')
  where user_id = p_user;
$$;

revoke execute on function public.recompute_rating(uuid) from anon, authenticated;

-- ---------- subject confirms or denies ----------
create or replace function public.respond_to_review(p_review_id uuid, p_confirm boolean)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare v_review public.reviews%rowtype;
begin
  select * into v_review from public.reviews
   where id = p_review_id and subject_id = auth.uid() and status = 'pending_confirmation';
  if not found then
    raise exception 'Review not found or not awaiting your confirmation.';
  end if;

  if not p_confirm then
    update public.reviews set status = 'rejected' where id = p_review_id;
    return 'rejected';
  end if;

  if v_review.work_url is not null then
    update public.reviews
       set subject_confirmed_at = now(), status = 'pending_verification', badge = 'mutual'
     where id = p_review_id;
    return 'pending_verification';
  else
    update public.reviews
       set subject_confirmed_at = now(), status = 'live', badge = 'mutual'
     where id = p_review_id;
    perform public.recompute_rating(v_review.subject_id);
    return 'live';
  end if;
end;
$$;

-- ---------- 14-day confirmation timeout ----------
create or replace function public.process_review_timeouts()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare v_count int;
begin
  with promoted as (
    update public.reviews
       set status = 'live', badge = 'one_party'
     where status = 'pending_confirmation'
       and created_at < now() - interval '14 days'
    returning subject_id
  )
  select count(*) into v_count from promoted;

  perform public.recompute_rating(subject_id)
    from (select distinct subject_id from public.reviews
          where status = 'live' and badge = 'one_party') s;

  return v_count;
end;
$$;

revoke execute on function public.process_review_timeouts() from anon, authenticated;

create extension if not exists pg_cron;
select cron.schedule('review-confirmation-timeouts', '15 6 * * *',
  $$select public.process_review_timeouts()$$);

-- ---------- admin actions ----------
create or replace function public.admin_assert()
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.profiles where user_id = auth.uid() and is_admin) then
    raise exception 'Admins only.';
  end if;
end;
$$;

create or replace function public.admin_remove_listing(p_listing_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_assert();
  update public.listings set status = 'removed' where id = p_listing_id;
end;
$$;

create or replace function public.admin_reject_review(p_review_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_subject uuid;
begin
  perform public.admin_assert();
  update public.reviews set status = 'rejected' where id = p_review_id returning subject_id into v_subject;
  if v_subject is not null then
    perform public.recompute_rating(v_subject);
  end if;
end;
$$;

create or replace function public.admin_resolve_report(p_report_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.admin_assert();
  update public.reports set status = 'resolved' where id = p_report_id;
end;
$$;
