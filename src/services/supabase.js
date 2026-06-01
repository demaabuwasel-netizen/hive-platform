import { createClient } from '@supabase/supabase-js'

const url  = import.meta.env.VITE_SUPABASE_URL
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.warn(
    '[Hive] Supabase env vars missing.\n' +
    'Copy .env.example to .env.local and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.\n' +
    'Get these from: https://supabase.com/dashboard → your project → Settings → API'
  )
}

export const supabase = createClient(url ?? '', key ?? '', {
  auth: {
    persistSession:     true,   // store session in localStorage (default, made explicit)
    autoRefreshToken:   true,   // refresh JWT before it expires (default, made explicit)
    detectSessionInUrl: true,   // pick up OAuth #access_token from URL (default, made explicit)
  },
})
