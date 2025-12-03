'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase, getCurrentUser, handleSupabaseError } from '@/lib/supabase'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import LoadingSpinner from '@/components/LoadingSpinner'
import { format } from 'date-fns'

export default function NoteDetailPage() {
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    fetchNote()
  }, [params.id])

  const fetchNote = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const user = await getCurrentUser()
      if (!user) {
        router.push('/auth')
        return
      }

      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

      if (fetchError) throw fetchError
      
      setNote(data)
    } catch (err) {
      const errorMessage = handleSupabaseError(err, 'Gagal memuat catatan')
      setError(errorMessage)
      console.error('Error fetching note:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    router.push(`/notes/${params.id}/edit`)
  }

  const handleDelete = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus catatan ini? Tindakan ini tidak dapat dibatalkan.')) {
      return
    }

    try {
      setIsDeleting(true)
      const user = await getCurrentUser()
      if (!user) return

      const { error: deleteError } = await supabase
        .from('notes')
        .delete()
        .eq('id', params.id)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError
      
      router.push('/')
    } catch (err) {
      const errorMessage = handleSupabaseError(err, 'Gagal menghapus catatan')
      setError(errorMessage)
      console.error('Error deleting note:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleFavorite = async () => {
    if (!note) return

    try {
      const user = await getCurrentUser()
      if (!user) return

      const { error: updateError } = await supabase
        .from('notes')
        .update({ 
          is_favorite: !note.is_favorite,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .eq('user_id', user.id)

      if (updateError) throw updateError
      
      setNote(prev => ({ ...prev, is_favorite: !prev.is_favorite }))
    } catch (err) {
      const errorMessage = handleSupabaseError(err, 'Gagal memperbarui catatan')
      setError(errorMessage)
      console.error('Error toggling favorite:', err)
    }
  }

  const togglePin = async () => {
    if (!note) return

    try {
      const user = await getCurrentUser()
      if (!user) return

      const { error: updateError } = await supabase
        .from('notes')
        .update({ 
          is_pinned: !note.is_pinned,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .eq('user_id', user.id)

      if (updateError) throw updateError
      
      setNote(prev => ({ ...prev, is_pinned: !prev.is_pinned }))
    } catch (err) {
      const errorMessage = handleSupabaseError(err, 'Gagal memperbarui catatan')
      setError(errorMessage)
      console.error('Error toggling pin:', err)
    }
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return format(date, 'd MMM yyyy • HH:mm')
    } catch {
      return dateString
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      work: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      personal: 'bg-green-500/20 text-green-300 border-green-500/30',
      ideas: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      learning: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      meeting: 'bg-red-500/20 text-red-300 border-red-500/30',
      general: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    }
    return colors[category] || colors.general
  }

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      pink: 'bg-pink-500',
    }
    return colors[color] || colors.purple
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-300 mb-2">Gagal Memuat Catatan</h3>
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg transition-colors"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!note) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-2">Catatan Tidak Ditemukan</h3>
          <p className="text-gray-400 mb-6">Catatan yang Anda cari tidak ditemukan atau Anda tidak memiliki izin untuk melihatnya.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-medium transition-all duration-200"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push('/')}
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
              title="Kembali ke dashboard"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{note.title || 'Catatan Tanpa Judul'}</h1>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                <span>Dibuat: {formatDate(note.created_at)}</span>
                <span>•</span>
                <span>Diperbarui: {formatDate(note.updated_at)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={togglePin}
              className={`p-2 rounded-lg ${note.is_pinned
                  ? 'text-yellow-400 bg-yellow-400/10'
                  : 'text-gray-400 hover:bg-gray-800/50'
                } transition-colors`}
              title={note.is_pinned ? 'Lepas sematan' : 'Sematkan'}
            >
              <svg className="w-6 h-6" fill={note.is_pinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>

            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-lg ${note.is_favorite
                  ? 'text-yellow-400 bg-yellow-400/10'
                  : 'text-gray-400 hover:bg-gray-800/50'
                } transition-colors`}
              title={note.is_favorite ? 'Hapus dari favorit' : 'Tambahkan ke favorit'}
            >
              <svg className="w-6 h-6" fill={note.is_favorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>

            <button
              onClick={handleEdit}
              className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
              title="Edit catatan"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
              title="Hapus catatan"
            >
              {isDeleting ? (
                <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className={`w-4 h-4 rounded-full ${getColorClass(note.color)}`}></div>

          <span className={`px-3 py-1.5 text-sm rounded-lg border ${getCategoryColor(note.category)}`}>
            {note.category === 'work' && 'Pekerjaan'}
            {note.category === 'personal' && 'Pribadi'}
            {note.category === 'ideas' && 'Ide'}
            {note.category === 'learning' && 'Pembelajaran'}
            {note.category === 'meeting' && 'Rapat'}
            {note.category === 'general' && 'Umum'}
          </span>

          {Array.isArray(note.tags) && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1.5 text-sm bg-purple-500/10 text-purple-300 rounded-lg border border-purple-500/20"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="ml-auto text-sm text-gray-400">
            {note.word_count || 0} kata
          </div>
        </div>
      </div>

      <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 overflow-hidden">
        {note.content ? (
          <div className="p-6 md:p-8">
            <MarkdownRenderer content={note.content} />
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Tidak Ada Konten</h3>
            <p className="text-gray-400 mb-6">Catatan ini belum memiliki konten.</p>
            <button
              onClick={handleEdit}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-medium transition-all duration-200"
            >
              Tambah Konten
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-700/50">
        <div className="flex justify-between items-center text-sm text-gray-400">
          <div className="flex items-center space-x-4">
            <span>ID Catatan: {note.id.substring(0, 8)}...</span>
            <span>•</span>
            <span>Karakter: {(note.content || '').length}</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="text-gray-400 hover:text-gray-300 transition-colors"
              title="Salin tautan catatan"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </button>
            <button
              onClick={() => window.print()}
              className="text-gray-400 hover:text-gray-300 transition-colors"
              title="Cetak catatan"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}