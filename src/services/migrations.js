// Non-blocking migration check — just logs warnings, doesn't affect app startup
export function runMigrations() {
  // Fire and forget — don't await, don't block
  setTimeout(async () => {
    try {
      console.log('[migrations] starting background check...')
      // Just log reminders — actual migrations need to be done in Supabase manually
      console.warn('[migrations] ⚠️  Reminder: if NGO profile is incomplete, run the migration SQL in Supabase')
      console.warn('[migrations] Go to: Supabase SQL Editor → paste supabase/add_ngo_fields.sql → Run')
      console.warn('[migrations] ⚠️  Reminder: if student profile is incomplete, run the migration SQL in Supabase')
      console.warn('[migrations] Go to: Supabase SQL Editor → paste supabase/add_student_fields.sql → Run')
      console.warn('[migrations] ⚠️  Reminder: for the Analytics applicant map, run supabase/add_student_location.sql')
    } catch (err) {
      // Silent fail
    }
  }, 3000)
}
