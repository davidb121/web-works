-- Web Works — migration 004: Phase 3 email notifications
-- Outbox + triggers (review request / review live), listing lifecycle
-- (expire + 7-day warning), cron drain via pg_net -> notify edge function.
-- Run after 003. Requires edge secrets: RESEND_API_KEY, NOTIFY_SECRET.

create extension if not exists pg_net;

-- Shared secret so only our cron can invoke the notify function.
-- DO NOT COMMIT A REAL VALUE. Generate one (e.g. `openssl rand -hex 24`),
-- run this statement manually with it, and set the same value as the
-- NOTIFY_SECRET edge function secret. To rotate later:
--   select vault.update_secret((select id from vault.secrets where name='notify_secret'), '<new-value>');
select vault.create_secret('REPLACE_ME_BEFORE_RUNNING', 'notify_secret');

-- ---------- outbox ----------
create table public.email_outbox (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  template text not null,
  payload jsonb not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'sent', 'error')),
  error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);
create index email_outbox_pending_idx on public.email_outbox (status, created_at);
alter table public.email_outbox enable row level security;
-- No policies: service role only.

create or replace function public.enqueue_email(p_to text, p_template text, p_payload jsonb)
returns void language sql security definer set search_path = public as $$
  insert into public.email_outbox (to_email, template, payload)
  select p_to, p_template, p_payload where p_to is not null;
$$;
revoke execute on function public.enqueue_email(text, text, jsonb) from anon, authenticated;

create or replace function public.user_email(p_user uuid)
returns text language sql security definer set search_path = public as $$
  select email from auth.users where id = p_user;
$$;
revoke execute on function public.user_email(uuid) from anon, authenticated;

-- ---------- review notifications ----------
create or replace function public.trg_review_notifications()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_email text; v_name text;
begin
  if tg_op = 'INSERT' and new.status = 'pending_confirmation' then
    select display_name into v_name from public.profiles where user_id = new.author_id;
    perform public.enqueue_email(
      public.user_email(new.subject_id), 'review_request',
      jsonb_build_object('author_name', v_name, 'rating', new.rating, 'body', left(new.body, 300)));
  elsif tg_op = 'UPDATE' and new.status = 'live' and old.status <> 'live' then
    select display_name into v_name from public.profiles where user_id = new.subject_id;
    perform public.enqueue_email(
      public.user_email(new.author_id), 'review_live',
      jsonb_build_object('subject_name', v_name, 'badge', new.badge));
  end if;
  return new;
end $$;

create trigger review_notifications
  after insert or update on public.reviews
  for each row execute function public.trg_review_notifications();

-- ---------- listing lifecycle ----------
alter table public.listings add column last_expiry_warning_at timestamptz;
alter table public.subscriptions add column cancel_at_period_end boolean not null default false;

create or replace function public.process_listing_lifecycle()
returns void language plpgsql security definer set search_path = public as $$
declare r record;
begin
  -- Expire listings past their paid-through date.
  for r in
    update public.listings set status = 'expired'
     where status = 'active' and expires_at is not null and expires_at < now()
     returning id, title, owner_id
  loop
    perform public.enqueue_email(public.user_email(r.owner_id), 'listing_expired',
      jsonb_build_object('title', r.title));
  end loop;

  -- Warn owners whose ad lapses within 7 days and won't auto-renew.
  for r in
    update public.listings l set last_expiry_warning_at = now()
      from public.subscriptions s
     where s.listing_id = l.id
       and l.status = 'active'
       and l.expires_at between now() and now() + interval '7 days'
       and l.last_expiry_warning_at is null
       and (s.cancel_at_period_end or s.status in ('canceled', 'unpaid', 'past_due', 'incomplete_expired'))
     returning l.title, l.owner_id, l.expires_at
  loop
    perform public.enqueue_email(public.user_email(r.owner_id), 'expiry_warning',
      jsonb_build_object('title', r.title, 'expires_on', to_char(r.expires_at, 'FMMonth DD, YYYY')));
  end loop;
end $$;

revoke execute on function public.process_listing_lifecycle() from anon, authenticated;

-- ---------- cron: drain outbox every 5 min, lifecycle daily ----------
select cron.schedule('email-outbox-drain', '*/5 * * * *', $$
  select net.http_post(
    url := 'https://ubqqfqnuvqbdyzrrsdnh.supabase.co/functions/v1/notify',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-notify-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'notify_secret')),
    body := '{}'::jsonb)
  where exists (select 1 from public.email_outbox where status = 'pending');
$$);

select cron.schedule('listing-lifecycle', '0 6 * * *',
  $$select public.process_listing_lifecycle()$$);
