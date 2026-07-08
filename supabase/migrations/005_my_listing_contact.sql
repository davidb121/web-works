-- Web Works — migration 005
-- Owners can read their own listing's contact_info (column-level select is
-- revoked for everyone; reveal_contact() gates access for non-owners).
-- Needed by the edit-listing modal on My Listings.

create or replace function public.my_listing_contact(p_listing_id uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select contact_info from public.listings
   where id = p_listing_id and owner_id = auth.uid();
$$;
