// Simple in-memory cache with TTL (Time To Live)

class Cache {
  constructor() {
    this.cache = new Map()
    this.defaultTTL = 5 * 60 * 1000 // 5 minutes in milliseconds
  }

  set(key, data, ttl = this.defaultTTL) {
    const expiresAt = Date.now() + ttl
    this.cache.set(key, {
      data,
      expiresAt,
      ttl
    })
    return true
  }

  get(key) {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    // Check if cache has expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key) {
    return this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  has(key) {
    const item = this.cache.get(key)
    if (!item) return false
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }

  getStats() {
    const keys = Array.from(this.cache.keys())
    const stats = {
      totalItems: keys.length,
      items: {}
    }

    keys.forEach(key => {
      const item = this.cache.get(key)
      const remainingTime = item.expiresAt - Date.now()
      stats.items[key] = {
        hasExpired: remainingTime <= 0,
        remainingTime: Math.max(0, remainingTime),
        ttl: item.ttl
      }
    })

    return stats
  }
}

// Create singleton instance
const cache = new Cache()

// Cache keys
export const CACHE_KEYS = {
  DASHBOARD_STATS: 'dashboard_stats',
  RECENT_NOTES: 'recent_notes',
  USER_NOTES: (userId) => `user_notes_${userId}`,
  NOTE_DETAIL: (noteId) => `note_detail_${noteId}`
}

// Helper function to invalidate cache
export const invalidateCache = (pattern) => {
  const keys = Array.from(cache.cache.keys())
  
  if (pattern instanceof RegExp) {
    keys.forEach(key => {
      if (pattern.test(key)) {
        cache.delete(key)
      }
    })
  } else if (typeof pattern === 'function') {
    keys.forEach(key => {
      if (pattern(key)) {
        cache.delete(key)
      }
    })
  } else {
    cache.delete(pattern)
  }
}

export default cache