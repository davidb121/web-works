-- 006_promo_per_kind.sql
-- Launch promo expanded: 200 discounted first-month slots for EACH listing kind
-- (project + talent/developers), replacing the single shared 100-slot counter.

-- ---------- rebuild promo_counter keyed by listing kind ----------
alter table public.promo_counter add column if not exists kind text;
update public.promo_counter set kind = 'project' where kind is null;

-- Repurpose the primary key from the old single-row id to the listing kind.
alter table public.promo_counter drop constraint promo_counter_pkey;
alter table public.promo_counter drop column id;              -- also drops the id=1 check + default
alter table public.promo_counter alter column kind set not null;
alter table public.promo_counter add primary key (kind);

-- Bump every counter's cap to 200 (preserving already-used project slots).
alter table public.promo_counter alter column promo_cap set default 200;
update public.promo_counter set promo_cap = 200;

-- Add the talent (developer) counter.
insert into public.promo_counter (kind, promo_used, promo_cap)
values ('talent', 0, 200)
on conflict (kind) do nothing;

-- ---------- kind-aware promo functions ----------
drop function if exists public.promo_remaining();
create or replace function public.promo_remaining(p_kind text)
returns int
language sql
security definer
set search_path = public
as $$
  select greatest(promo_cap - promo_used, 0) from public.promo_counter where kind = p_kind;
$$;

drop function if exists public.claim_promo_slot();
create or replace function public.claim_promo_slot(p_kind text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare claimed boolean := false;
begin
  update public.promo_counter
     set promo_used = promo_used + 1
   where kind = p_kind and promo_used < promo_cap;
  claimed := found;
  return claimed;
end;
$$;

-- Clients may read remaining slots but never claim one directly.
revoke execute on function public.claim_promo_slot(text) from anon, authenticated;
