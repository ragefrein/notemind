'use client'

import { useState, useEffect } from 'react'
import { supabase, fetchWithCache, CACHE_KEYS } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function RecentNotes() {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isCached, setIsCached] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchRecentNotes()
    checkMobile()
    
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768)
  }

  const fetchRecentNotes = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const fetchNotesData = async () => {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(isMobile ? 3 : 5)

        if (error) throw error
        return data || []
      }

      const cachedNotes = await fetchWithCache(
        CACHE_KEYS.RECENT_NOTES,
        fetchNotesData,
        2 * 60 * 1000
      )

      if (cachedNotes) {
        setNotes(cachedNotes)
        const cache = await import('@/lib/cache').then(mod => mod.default)
        setIsCached(cache.has(CACHE_KEYS.RECENT_NOTES))
      }
    } catch (error) {
      console.error('Error fetching notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (isMobile) {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now - date)
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
      
      if (diffHours < 24) {
        return `${diffHours} jam lalu`
      }
      return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
    }
    
    return new Date(dateString).toLocaleDateString('id-ID', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-gray-700/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg md:text-xl font-semibold">Catatan Terbaru</h2>
          <div className="h-6 w-16 md:h-8 md:w-24 bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
        <div className="space-y-3 md:space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 md:h-20 bg-gray-700/50 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-4 md:p-6 border border-gray-700/50">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg md:text-xl font-semibold">Catatan Terbaru</h2>
          {isCached && (
            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
              Tersimpan
            </span>
          )}
        </div>
        <button
          onClick={() => router.push('/notes')}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          Lihat Semua →
        </button>
      </div>

      <div className="space-y-3 md:space-y-4">
        {notes.length === 0 ? (
          <div className="text-center py-6 md:py-8 text-gray-400">
            <div className="text-3xl md:text-4xl mb-3 md:mb-4">📝</div>
            <p className="text-sm md:text-base">Belum ada catatan. Buat catatan pertama Anda!</p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              onClick={() => router.push(`/notes/${note.id}`)}
              className={`group p-3 md:p-4 bg-gray-800/20 hover:bg-gray-700/30 rounded-xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-200 cursor-pointer ${isMobile ? 'active:scale-95' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-sm md:text-base truncate group-hover:text-purple-300 transition-colors">
                  {note.title || 'Tanpa Judul'}
                </h3>
                <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-all duration-200">
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
              <p className="text-xs md:text-sm text-gray-400 line-clamp-2 mb-2">
                {note.content || 'Tidak ada konten'}
              </p>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>{formatDate(note.updated_at)}</span>
                {note.is_favorite && (
                  <span className="text-yellow-400">⭐</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}