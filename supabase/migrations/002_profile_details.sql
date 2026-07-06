-- Web Works — migration 002: richer profiles
-- Adds LinkedIn, resume, time zone, and skills to profiles + a resumes bucket.
-- Run in the Supabase SQL editor after 001.

alter table public.profiles
  add column linkedin_url text check (linkedin_url is null or linkedin_url ~* '^https://(www\.)?linkedin\.com/'),
  add column resume_url text,
  add column timezone text,
  add column skills text[] not null default '{}' check (array_length(skills, 1) is null or array_length(skills, 1) <= 20);

-- ---------- storage bucket for resumes (public, like listings themselves) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('resumes', 'resumes', true, 5242880, array['application/pdf']);

create policy "resumes publicly readable"
  on storage.objects for select using (bucket_id = 'resumes');

create policy "users upload own resume"
  on storage.objects for insert
  with check (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "users update own resume"
  on storage.objects for update
  using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "users delete own resume"
  on storage.objects for delete
  using (bucket_id = 'resumes' and auth.uid()::text = (storage.foldername(name))[1]);
