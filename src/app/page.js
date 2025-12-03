'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'
import StatsCard from '@/components/StatsCard'
import RecentNotes from '@/components/RecentNotes'
import QuickActions from '@/components/QuickActions'
import MobileStatsCarousel from '@/components/MobileStatsCarousel'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    totalNotes: 0,
    todayNotes: 0,
    favoriteNotes: 0,
    pinnedNotes: 0,
    totalWords: 0
  })
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchStats()
    checkMobile()
    const handleResize = () => {
      checkMobile()
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768)
  }

  const checkUser = async () => {
    const user = await getCurrentUser()
    if (!user) {
      router.push('/auth')
    } else {
      setUser(user)
    }
  }

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
      setStats({
        totalNotes: 0,
        todayNotes: 0,
        favoriteNotes: 0,
        pinnedNotes: 0,
        totalWords: 0
      })
      router.push('/auth')
    } catch (error) {
      console.error('Error saat logout:', error)
      alert('Gagal logout. Silakan coba lagi.')
    } finally {
      setLoggingOut(false)
    }
  }

  const fetchStats = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) return
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayISO = today.toISOString()
      const [
        totalNotesRes,
        todayNotesRes,
        favoriteNotesRes,
        pinnedNotesRes,
        allNotesRes
      ] = await Promise.all([
        supabase
          .from('notes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),

        supabase
          .from('notes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', todayISO),

        supabase
          .from('notes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_favorite', true),

        supabase
          .from('notes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_pinned', true),

        supabase
          .from('notes')
          .select('word_count')
          .eq('user_id', user.id)
      ])

      const totalWords = allNotesRes.data?.reduce((acc, note) => 
        acc + (note.word_count || 0), 0
      ) || 0

      setStats({
        totalNotes: totalNotesRes.count || 0,
        todayNotes: todayNotesRes.count || 0,
        favoriteNotes: favoriteNotesRes.count || 0,
        pinnedNotes: pinnedNotesRes.count || 0,
        totalWords
      })
    } catch (error) {
      console.error('Error mengambil statistik:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse p-4 md:p-6">
        <div className="h-8 bg-gray-800 rounded w-48 mb-8"></div>
        <div className="md:hidden space-y-4 mb-8">
          <div className="h-32 bg-gray-800/50 rounded-xl"></div>
          <div className="flex gap-4">
            <div className="flex-1 h-8 bg-gray-800/50 rounded-lg"></div>
            <div className="flex-1 h-8 bg-gray-800/50 rounded-lg"></div>
          </div>
        </div>
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-gray-800/50 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-800/50 rounded-xl"></div>
          <div className="h-96 bg-gray-800/50 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-8 p-4 md:p-6">
      <div className="relative bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 md:p-8 border border-purple-500/20">
        <div className="absolute top-4 right-4 md:top-6 md:right-6">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loggingOut ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">Sedang logout...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm">Logout</span>
              </>
            )}
          </button>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold mb-2 pr-20">
          Selamat datang kembali, {user?.email?.split('@')[0]}! 👋
        </h1>
        <p className="text-gray-300 text-sm md:text-base">
          Kamu memiliki {stats.totalNotes} catatan. {stats.todayNotes > 0 ? `Membuat ${stats.todayNotes} hari ini.` : 'Mulai menulis!'}
        </p>
      </div>
      <div className="md:hidden">
        <MobileStatsCarousel stats={stats} />
      </div>
      
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <StatsCard
          title="Total Catatan"
          value={stats.totalNotes}
          icon="📝"
          color="from-blue-500 to-cyan-500"
          trend={`+${Math.floor(stats.totalNotes * 0.1)}`}
          compact={false}
        />
        <StatsCard
          title="Hari Ini"
          value={stats.todayNotes}
          icon="⚡"
          color="from-green-500 to-emerald-500"
          trend={`+${stats.todayNotes}`}
          compact={false}
        />
        <StatsCard
          title="Favorit"
          value={stats.favoriteNotes}
          icon="⭐"
          color="from-yellow-500 to-orange-500"
          trend={`+${Math.floor(stats.favoriteNotes * 0.2)}`}
          compact={false}
        />
        <StatsCard
          title="Disematkan"
          value={stats.pinnedNotes}
          icon="📌"
          color="from-purple-500 to-pink-500"
          trend={`+${Math.floor(stats.pinnedNotes * 0.15)}`}
          compact={false}
        />
        <StatsCard
          title="Total Kata"
          value={stats.totalWords.toLocaleString()}
          icon="📖"
          color="from-indigo-500 to-blue-500"
          trend={`+${Math.floor(stats.totalWords * 0.05).toLocaleString()}`}
          compact={false}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <RecentNotes />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  )
}