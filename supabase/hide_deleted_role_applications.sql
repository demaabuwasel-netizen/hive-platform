-- Keeps deleted NGO roles from appearing as stale student applications.
-- The app also filters null opportunity_id rows, but this cleans old rows and
-- lets NGOs delete related applications before deleting an opportunity.

delete from public.applications
where opportunity_id is null;

drop policy if exists "applications_delete_ngo" on public.applications;

create policy "applications_delete_ngo" on public.applications
  for delete using (
    exists (
      select 1 from public.opportunities o
      where o.id = opportunity_id and o.ngo_id = auth.uid()
    )
    or auth.uid() = ngo_id
  );
