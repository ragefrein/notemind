import { createClient } from '@supabase/supabase-js'
import cache, { CACHE_KEYS, invalidateCache } from './cache'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Cek environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing!')
  console.log('URL:', supabaseUrl ? 'Set' : 'Missing')
  console.log('Key:', supabaseAnonKey ? 'Set' : 'Missing')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Cache-enabled fetch functions
export const fetchWithCache = async (key, fetchFn, ttl = 5 * 60 * 1000) => {
  // Try to get from cache first
  const cachedData = cache.get(key)
  if (cachedData) {
    console.log(`[Cache] Hit for key: ${key}`)
    return cachedData
  }

  console.log(`[Cache] Miss for key: ${key}, fetching...`)
  
  // Fetch fresh data
  const data = await fetchFn()
  
  // Cache the result
  if (data !== null && data !== undefined) {
    cache.set(key, data, ttl)
  }
  
  return data
}

// Helper function untuk mendapatkan session
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

// Helper function untuk mendapatkan user
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

// Cache-enabled user fetching
export const getCurrentUserWithCache = async () => {
  const user = await getCurrentUser()
  if (user) {
    // Cache user data for 10 minutes
    cache.set(`user_${user.id}`, user, 10 * 60 * 1000)
  }
  return user
}

// Helper untuk error handling
export const handleSupabaseError = (error, defaultMessage = 'An error occurred') => {
  console.error('Supabase Error:', error)
  
  if (error?.message?.includes('JWT')) {
    return 'Session expired. Please sign in again.'
  }
  
  if (error?.message?.includes('network')) {
    return 'Network error. Please check your connection.'
  }
  
  if (error?.message?.includes('permission')) {
    return 'You don\'t have permission to perform this action.'
  }
  
  return error?.message || defaultMessage
}

// Invalidate cache on note changes
export const setupCacheInvalidation = () => {
  const channel = supabase
    .channel('cache-invalidation')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notes'
      },
      (payload) => {
        console.log('[Cache] Invalidating due to note change:', payload)
        
        // Invalidate dashboard stats
        invalidateCache(CACHE_KEYS.DASHBOARD_STATS)
        
        // Invalidate recent notes
        invalidateCache(CACHE_KEYS.RECENT_NOTES)
        
        // Invalidate user-specific notes cache
        if (payload.new?.user_id) {
          invalidateCache(CACHE_KEYS.USER_NOTES(payload.new.user_id))
        }
        
        // Invalidate specific note cache
        if (payload.new?.id) {
          invalidateCache(CACHE_KEYS.NOTE_DETAIL(payload.new.id))
        }
        
        if (payload.old?.id) {
          invalidateCache(CACHE_KEYS.NOTE_DETAIL(payload.old.id))
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Export cache utilities
export { cache, CACHE_KEYS, invalidateCache }