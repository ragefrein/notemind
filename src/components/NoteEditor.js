'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser, handleSupabaseError } from '@/lib/supabase'

export default function NoteEditor({ noteId, onSave, onCancel }) {
  const [judul, setJudul] = useState('')
  const [konten, setKonten] = useState('')
  const [isFavorit, setIsFavorit] = useState(false)
  const [isDisematkan, setIsDisematkan] = useState(false)
  const [kategori, setKategori] = useState('general')
  const [warna, setWarna] = useState('purple')
  const [tag, setTag] = useState([])
  const [tagSaatIni, setTagSaatIni] = useState('')
  const [memuat, setMemuat] = useState(false)
  const [menyimpan, setMenyimpan] = useState(false)
  const [error, setError] = useState(null)
  const textareaRef = useRef(null)
  const router = useRouter()

  const daftarKategori = [
    { value: 'general', label: 'Umum', color: 'gray' },
    { value: 'work', label: 'Pekerjaan', color: 'blue' },
    { value: 'personal', label: 'Pribadi', color: 'green' },
    { value: 'ideas', label: 'Ide', color: 'yellow' },
    { value: 'learning', label: 'Pembelajaran', color: 'purple' },
    { value: 'meeting', label: 'Rapat', color: 'red' },
  ]

  const daftarWarna = [
    { name: 'purple', value: 'bg-purple-500', text: 'text-purple-500' },
    { name: 'blue', value: 'bg-blue-500', text: 'text-blue-500' },
    { name: 'green', value: 'bg-green-500', text: 'text-green-500' },
    { name: 'yellow', value: 'bg-yellow-500', text: 'text-yellow-500' },
    { name: 'red', value: 'bg-red-500', text: 'text-red-500' },
    { name: 'pink', value: 'bg-pink-500', text: 'text-pink-500' },
  ]

  const tagSaran = [
    'pekerjaan', 'pribadi', 'penting', 'todo', 'ide', 
    'proyek', 'rapat', 'pembelajaran', 'referensi', 'mendesak'
  ]

  useEffect(() => {
    if (noteId) {
      ambilCatatan()
    }
  }, [noteId])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  const ambilCatatan = async () => {
    try {
      setMemuat(true)
      setError(null)
      
      const pengguna = await getCurrentUser()
      if (!pengguna) {
        router.push('/auth')
        return
      }

      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .eq('user_id', pengguna.id)
        .single()

      if (fetchError) throw fetchError
      
      if (data) {
        setJudul(data.title || '')
        setKonten(data.content || '')
        setIsFavorit(data.is_favorite || false)
        setIsDisematkan(data.is_pinned || false)
        setKategori(data.category || 'general')
        setWarna(data.color || 'purple')
        setTag(Array.isArray(data.tags) ? data.tags : [])
      }
    } catch (err) {
      const pesanError = handleSupabaseError(err, 'Gagal memuat catatan')
      setError(pesanError)
      console.error('Error mengambil catatan:', err)
    } finally {
      setMemuat(false)
    }
  }

  const tambahTag = () => {
    if (tagSaatIni.trim() && !tag.includes(tagSaatIni.trim())) {
      setTag([...tag, tagSaatIni.trim()])
      setTagSaatIni('')
    }
  }

  const hapusTag = (tagYangDihapus) => {
    setTag(tag.filter(t => t !== tagYangDihapus))
  }

  const tambahTagSaran = (tag) => {
    if (!tag.includes(tag)) {
      setTag([...tag, tag])
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.type === 'text') {
      tambahTag()
      e.preventDefault()
    }
  }

  const handleSimpan = async () => {
    if (!judul.trim()) {
      setError('Judul diperlukan')
      return
    }

    try {
      setMenyimpan(true)
      setError(null)
      
      const pengguna = await getCurrentUser()
      if (!pengguna) {
        router.push('/auth')
        return
      }

      const dataCatatan = {
        title: judul.trim(),
        content: konten.trim(),
        is_favorite: isFavorit,
        is_pinned: isDisematkan,
        category: kategori,
        color: warna,
        tags: tag,
        updated_at: new Date().toISOString(),
      }

      let hasil
      
      if (noteId) {
        const { data, error: updateError } = await supabase
          .from('notes')
          .update(dataCatatan)
          .eq('id', noteId)
          .eq('user_id', pengguna.id)
          .select()
          .single()

        if (updateError) throw updateError
        hasil = { success: true, data }
      } else {
        const { data, error: createError } = await supabase
          .from('notes')
          .insert([{
            ...dataCatatan,
            user_id: pengguna.id,
            created_at: new Date().toISOString(),
          }])
          .select()
          .single()

        if (createError) throw createError
        hasil = { success: true, data }
      }

      if (hasil.success) {
        onSave?.(hasil.data)
      }
    } catch (err) {
      const pesanError = handleSupabaseError(err, 'Gagal menyimpan catatan')
      setError(pesanError)
      console.error('Error menyimpan catatan:', err)
    } finally {
      setMenyimpan(false)
    }
  }

  const handleHapus = async () => {
    if (!noteId) return
    
    if (!confirm('Apakah Anda yakin ingin menghapus catatan ini? Tindakan ini tidak dapat dibatalkan.')) {
      return
    }

    try {
      const pengguna = await getCurrentUser()
      if (!pengguna) return

      const { error: deleteError } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', pengguna.id)

      if (deleteError) throw deleteError
      
      router.push('/')
    } catch (err) {
      const pesanError = handleSupabaseError(err, 'Gagal menghapus catatan')
      setError(pesanError)
      console.error('Error menghapus catatan:', err)
    }
  }

  const jumlahKata = konten.trim().split(/\s+/).filter(kata => kata.length > 0).length
  const jumlahKarakter = konten.length

  if (memuat) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-800 rounded-xl w-3/4 mb-6"></div>
          <div className="h-96 bg-gray-800 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
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

      <div className="lg:hidden fixed bottom-6 right-6 z-30">
        <div className="flex flex-col items-end space-y-2">
          <button
            onClick={handleSimpan}
            disabled={menyimpan}
            className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full shadow-lg font-medium transition-all duration-200 disabled:opacity-50"
          >
            {menyimpan ? (
              <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold">
            {noteId ? 'Edit Catatan' : 'Catatan Baru'}
          </h1>
        </div>

        <div className="flex items-center justify-between sm:justify-normal space-x-2 sm:space-x-3">
          <button
            onClick={handleSimpan}
            disabled={menyimpan}
            className="hidden lg:flex px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 text-sm sm:text-base"
          >
            {menyimpan ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menyimpan...
              </span>
            ) : (
              'Simpan'
            )}
          </button>

          <button
            onClick={handleSimpan}
            disabled={menyimpan}
            className="lg:hidden px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 text-sm"
          >
            Simpan
          </button>

          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setIsDisematkan(!isDisematkan)}
              className={`p-2 rounded-lg ${isDisematkan
                  ? 'text-yellow-400 bg-yellow-400/10'
                  : 'text-gray-400 hover:bg-gray-800/50'
                } transition-colors`}
              title={isDisematkan ? 'Lepas sematan' : 'Sematkan'}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill={isDisematkan ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>

            <button
              onClick={() => setIsFavorit(!isFavorit)}
              className={`p-2 rounded-lg ${isFavorit
                  ? 'text-yellow-400 bg-yellow-400/10'
                  : 'text-gray-400 hover:bg-gray-800/50'
                } transition-colors`}
              title={isFavorit ? 'Hapus dari favorit' : 'Tambahkan ke favorit'}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill={isFavorit ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>

            {noteId && (
              <button
                onClick={handleHapus}
                className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                title="Hapus catatan"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <input
            type="text"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            placeholder="Judul Catatan"
            className="w-full px-4 sm:px-6 py-3 sm:py-4 text-xl sm:text-3xl font-bold bg-gray-800/30 border border-gray-700/50 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent placeholder-gray-500"
          />
        </div>

        <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Kategori
            </label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800/30 border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent text-sm sm:text-base"
            >
              {daftarKategori.map(kat => (
                <option key={kat.value} value={kat.value}>
                  {kat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Warna
            </label>
            <div className="flex flex-wrap gap-2">
              {daftarWarna.map(warnaOption => (
                <button
                  key={warnaOption.name}
                  onClick={() => setWarna(warnaOption.name)}
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${warnaOption.value} ${warna === warnaOption.name ? 'ring-2 ring-white ring-offset-1 sm:ring-offset-2 ring-offset-gray-800' : ''}`}
                  title={warnaOption.name}
                />
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tag
            </label>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
              {tag.map((t, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-purple-500/20 text-purple-300"
                >
                  {t}
                  <button
                    onClick={() => hapusTag(t)}
                    className="ml-1 sm:ml-2 text-purple-400 hover:text-purple-300 text-sm"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={tagSaatIni}
                onChange={(e) => setTagSaatIni(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tambahkan tag..."
                className="flex-1 px-4 py-2 bg-gray-800/30 border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent text-sm sm:text-base"
              />
              <button
                onClick={tambahTag}
                className="px-4 py-2 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 rounded-xl text-sm sm:text-base"
              >
                Tambah
              </button>
            </div>
            
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-2">Tag yang disarankan:</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {tagSaran.map(t => (
                  <button
                    key={t}
                    onClick={() => tambahTagSaran(t)}
                    disabled={tag.includes(t)}
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs ${tag.includes(t)
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-400">
            <span>{jumlahKata} kata</span>
            <span className="hidden sm:inline">•</span>
            <span>{jumlahKarakter} karakter</span>
          </div>
          
          <textarea
            ref={textareaRef}
            value={konten}
            onChange={(e) => setKonten(e.target.value)}
            placeholder="Mulai ketik catatan Anda di sini..."
            rows={12}
            className="w-full px-4 sm:px-6 py-4 sm:py-8 bg-gray-800/30 border border-gray-700/50 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent resize-none placeholder-gray-500 leading-relaxed text-sm sm:text-base"
          />
        </div>

        <div className="lg:hidden flex flex-col space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsDisematkan(!isDisematkan)}
                className={`px-3 py-1.5 rounded-lg ${isDisematkan
                    ? 'text-yellow-400 bg-yellow-400/10'
                    : 'text-gray-400 hover:bg-gray-800/50'
                  } transition-colors text-sm`}
              >
                {isDisematkan ? 'Disematkan' : 'Sematkan'}
              </button>
              <button
                onClick={() => setIsFavorit(!isFavorit)}
                className={`px-3 py-1.5 rounded-lg ${isFavorit
                    ? 'text-yellow-400 bg-yellow-400/10'
                    : 'text-gray-400 hover:bg-gray-800/50'
                  } transition-colors text-sm`}
              >
                {isFavorit ? 'Favorit' : 'Favoritkan'}
              </button>
            </div>
          </div>
          
          {noteId && (
            <button
              onClick={handleHapus}
              className="w-full px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl border border-red-400/30 transition-colors text-sm"
            >
              Hapus Catatan
            </button>
          )}
        </div>
      </div>
    </div>
  )
}