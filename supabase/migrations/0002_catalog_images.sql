-- Adds a public storage bucket for curated food/recipe photos. Reads are public
-- (anon + authenticated); writes are effectively restricted to the service role
-- key (used only by scripts/upload-images.mjs) because no insert/update/delete
-- policy is granted to anon/authenticated — photos are curated/admin-uploaded
-- only in this phase, not an end-user upload feature.
-- Idempotent: safe to paste into the Supabase SQL editor more than once.

insert into storage.buckets (id, name, public)
values ('catalog-images', 'catalog-images', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "catalog-images public read" on storage.objects;
create policy "catalog-images public read"
  on storage.objects for select
  to public
  using (bucket_id = 'catalog-images');

drop policy if exists "catalog-images service role write" on storage.objects;
create policy "catalog-images service role write"
  on storage.objects for insert
  to service_role
  with check (bucket_id = 'catalog-images');

drop policy if exists "catalog-images service role update" on storage.objects;
create policy "catalog-images service role update"
  on storage.objects for update
  to service_role
  using (bucket_id = 'catalog-images')
  with check (bucket_id = 'catalog-images');

drop policy if exists "catalog-images service role delete" on storage.objects;
create policy "catalog-images service role delete"
  on storage.objects for delete
  to service_role
  using (bucket_id = 'catalog-images');
