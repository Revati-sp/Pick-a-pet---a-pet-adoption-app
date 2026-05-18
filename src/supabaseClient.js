import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars.\n' +
    'Copy .env.example → .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.\n' +
    'Find them at: Supabase Dashboard → Project Settings → API'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
