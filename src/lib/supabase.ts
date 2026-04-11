import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// After the guards above, these are guaranteed to be strings.
const url: string = supabaseUrl
const anonKey: string = supabaseAnonKey

/**
 * Browser / client-component Supabase client.
 * Safe to import in any Client Component or browser-side code.
 */
export const supabaseClient = createClient(url, anonKey)

/**
 * Server-side Supabase client that uses the service-role key when available,
 * falling back to the anon key.  Only import this in Server Components,
 * Route Handlers, or Server Actions — never ship this to the browser.
 */
export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? anonKey
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
