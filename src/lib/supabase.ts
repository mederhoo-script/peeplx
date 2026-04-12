import { createClient } from '@supabase/supabase-js'

function getRequiredEnvVars() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url) throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL')
  if (!anonKey) throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return { url, anonKey }
}

// Lazily initialised singleton so that the client is only created when first
// accessed (at request time), not at module-evaluation / build time.
let _supabaseClient: ReturnType<typeof createClient> | null = null

/**
 * Browser / client-component Supabase client.
 * Safe to import in any Client Component or browser-side code.
 */
export function getSupabaseClient() {
  if (!_supabaseClient) {
    const { url, anonKey } = getRequiredEnvVars()
    _supabaseClient = createClient(url, anonKey)
  }
  return _supabaseClient
}

/**
 * @deprecated Use {@link getSupabaseClient} instead.
 * Kept for backwards compatibility with existing client-side callers.
 */
export const supabaseClient = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

/**
 * Server-side Supabase client that uses the service-role key when available,
 * falling back to the anon key.  Only import this in Server Components,
 * Route Handlers, or Server Actions — never ship this to the browser.
 */
export function createServerClient() {
  const { url, anonKey } = getRequiredEnvVars()
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? anonKey
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
