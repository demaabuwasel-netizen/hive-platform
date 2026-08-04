-- Allows NGOs to mark an accepted role as completed.
-- This unlocks the student certificate flow.

alter table public.applications
  drop constraint if exists applications_status_check;

alter table public.applications
  add constraint applications_status_check
  check (status in (
    'submitted',
    'under_review',
    'shortlisted',
    'interview',
    'accepted',
    'completed',
    'rejected'
  ));
