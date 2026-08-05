-- Lets a student delete (withdraw) their own application.
-- Without this, only the NGO side could delete an application row —
-- students had no way to remove one from their own list.

create policy "applications_delete_student" on public.applications
  for delete using (auth.uid() = student_id);
