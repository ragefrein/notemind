'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser, handleSupabaseError } from '@/lib/supabase'

const CustomDropdown = ({ value, onChange, options, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState(options.find(opt => opt.value === value) || options[0])

  useEffect(() => {
    const selected = options.find(opt => opt.value === value) || options[0]
    setSelectedOption(selected)
  }, [value, options])

  const handleSelect = (option) => {
    setSelectedOption(option)
    if (onChange) {
      onChange(option.value)
    }
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-1.5 text-sm bg-gray-800/50 border border-gray-700/50 text-gray-300 rounded-lg 
                   focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50
                   appearance-none pr-8 cursor-pointer text-left flex justify-between items-center
                   hover:bg-gray-800/70 hover:border-gray-600/50 transition-all duration-200 ${className}`}
      >
        <span>{selectedOption.label}</span>
        <svg 
          className={`w-4 h-4 text-purple-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-1 bg-gray-800 border border-gray-700/50 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-700/50 transition-colors
                         ${selectedOption.value === option.value ? 'bg-purple-500/20 text-purple-300' : 'text-gray-300'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const CategoryDropdown = ({ value, onChange, options, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState(options.find(opt => opt.value === value) || options[5])

  useEffect(() => {
    const selected = options.find(opt => opt.value === value) || options[5]
    setSelectedOption(selected)
  }, [value, options])

  const handleSelect = (option) => {
    setSelectedOption(option)
    if (onChange) {
      onChange(option.value)
    }
    setIsOpen(false)
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

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-1.5 text-sm rounded-lg border ${getCategoryColor(value)}
                 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50
                 appearance-none pr-8 cursor-pointer text-left flex justify-between items-center
                 hover:opacity-90 transition-all duration-200 ${className}`}
      >
        <span>{selectedOption.label}</span>
        <svg 
          className={`w-4 h-4 text-current transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 w-full mt-1 bg-gray-800 border border-gray-700/50 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full px-3 py-2 text-sm text-left transition-colors
                         ${selectedOption.value === option.value 
                           ? getCategoryColor(option.value) 
                           : 'text-gray-300 hover:bg-gray-700/50'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function NewNotePage() {
  const [note, setNote] = useState({
    title: '',
    content: '',
    category: 'general',
    color: 'purple',
    tags: [],
    is_favorite: false,
    is_pinned: false
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [currentTag, setCurrentTag] = useState('')
  const [isFromAI, setIsFromAI] = useState(false)
  const router = useRouter()

  const categories = [
    { value: 'work', label: 'Pekerjaan' },
    { value: 'personal', label: 'Pribadi' },
    { value: 'ideas', label: 'Ide' },
    { value: 'learning', label: 'Pembelajaran' },
    { value: 'meeting', label: 'Rapat' },
    { value: 'general', label: 'Umum' },
  ]

  const colors = [
    { value: 'purple', label: 'Ungu', class: 'bg-purple-500' },
    { value: 'blue', label: 'Biru', class: 'bg-blue-500' },
    { value: 'green', label: 'Hijau', class: 'bg-green-500' },
    { value: 'yellow', label: 'Kuning', class: 'bg-yellow-500' },
    { value: 'red', label: 'Merah', class: 'bg-red-500' },
    { value: 'pink', label: 'Merah Muda', class: 'bg-pink-500' },
  ]

  useEffect(() => {
    checkUser()
    checkForAINote()
  }, [])

  const checkUser = async () => {
    const user = await getCurrentUser()
    if (!user) {
      router.push('/auth')
    }
  }

  const checkForAINote = () => {
    // Cek apakah ada catatan dari AI di localStorage
    const aiNoteData = localStorage.getItem('ai_generated_note')
    if (aiNoteData) {
      try {
        const noteData = JSON.parse(aiNoteData)
        
        setNote(prev => ({
          ...prev,
          title: noteData.title || '',
          content: noteData.content || '',
          category: noteData.category || 'learning',
          tags: [...prev.tags, ...(noteData.tags || ['ai-generated'])]
        }))
        
        setIsFromAI(true)
        
        // Hapus data setelah digunakan
        setTimeout(() => {
          localStorage.removeItem('ai_generated_note')
        }, 1000)
        
        // Tampilkan notifikasi
        setError(null)
        
      } catch (error) {
        console.error('Error loading AI note:', error)
      }
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNote(prev => ({ ...prev, [name]: value }))
  }

  const handleDropdownChange = (name, value) => {
    setNote(prev => ({ ...prev, [name]: value }))
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !note.tags.includes(currentTag.trim())) {
      setNote(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setNote(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault()
      handleAddTag()
    }
  }

  const calculateWordCount = (text) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/auth')
        return
      }

      const wordCount = calculateWordCount(note.content)

      const { data, error: insertError } = await supabase
        .from('notes')
        .insert({
          title: note.title || 'Catatan Tanpa Judul',
          content: note.content,
          user_id: user.id,
          word_count: wordCount,
          is_favorite: note.is_favorite,
          is_pinned: note.is_pinned,
          category: note.category,
          color: note.color,
          tags: note.tags
        })
        .select()
        .single()

      if (insertError) throw insertError
      
      router.push(`/notes/${data.id}`)
    } catch (err) {
      const errorMessage = handleSupabaseError(err, 'Gagal membuat catatan')
      setError(errorMessage)
      console.error('Error creating note:', err)
    } finally {
      setSaving(false)
    }
  }

  const toggleFavorite = () => {
    setNote(prev => ({ ...prev, is_favorite: !prev.is_favorite }))
  }

  const togglePin = () => {
    setNote(prev => ({ ...prev, is_pinned: !prev.is_pinned }))
  }

  const getCurrentColorClass = () => {
    return colors.find(col => col.value === note.color)?.class || 'bg-purple-500'
  }

  const clearAINote = () => {
    setNote({
      title: '',
      content: '',
      category: 'general',
      color: 'purple',
      tags: [],
      is_favorite: false,
      is_pinned: false
    })
    setIsFromAI(false)
    localStorage.removeItem('ai_generated_note')
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-800 rounded w-64"></div>
          <div className="h-12 bg-gray-800/50 rounded-xl"></div>
          <div className="h-96 bg-gray-800/50 rounded-xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Notifikasi Catatan dari AI */}
      {isFromAI && (
        <div className="mb-6 p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 mr-3">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h3 className="font-medium text-orange-300 mb-1">Catatan dari Asisten AI</h3>
                <p className="text-sm text-orange-400/80">
                  Catatan ini dibuat oleh Asisten AI. Anda dapat mengeditnya sebelum menyimpan.
                </p>
              </div>
            </div>
            <button
              onClick={clearAINote}
              className="px-3 py-1.5 text-sm bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 rounded-lg transition-colors"
            >
              Hapus
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
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
              onClick={() => router.push('/notes')}
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
              title="Kembali ke daftar catatan"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-200">
                {isFromAI ? 'Edit Catatan dari AI' : 'Buat Catatan Baru'}
              </h1>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                <span>{calculateWordCount(note.content)} kata</span>
                <span>•</span>
                <span>{note.content.length} karakter</span>
                {isFromAI && (
                  <>
                    <span>•</span>
                    <span className="text-orange-400">Dari AI</span>
                  </>
                )}
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

            {isFromAI && (
              <button
                onClick={() => router.push('/')}
                className="p-2 text-orange-400 hover:bg-orange-400/10 rounded-lg transition-colors"
                title="Kembali ke Asisten AI"
              >
                <span className="text-xl">🤖</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <div className={`w-4 h-4 rounded-full ${getCurrentColorClass()}`}></div>
            
            <div className="w-32">
              <CustomDropdown
                value={note.color}
                onChange={(value) => handleDropdownChange('color', value)}
                options={colors.map(color => ({ value: color.value, label: color.label }))}
              />
            </div>
          </div>

          <div className="w-32">
            <CategoryDropdown
              value={note.category}
              onChange={(value) => handleDropdownChange('category', value)}
              options={categories.map(cat => ({ value: cat.value, label: cat.label }))}
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tambahkan tag..."
                className="flex-1 px-3 py-1.5 text-sm bg-gray-800/30 border border-gray-700/50 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-300 placeholder-gray-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 text-sm bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded-r-lg hover:bg-purple-500/40 transition-colors"
              >
                Tambah
              </button>
            </div>
          </div>
        </div>

        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {note.tags.map((tag, index) => (
              <span
                key={index}
                className={`inline-flex items-center px-3 py-1.5 text-sm rounded-lg border ${
                  tag === 'ai-generated' || tag === 'asisten'
                    ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10 text-orange-300 border-orange-500/20'
                    : 'bg-purple-500/10 text-purple-300 border-purple-500/20'
                }`}
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className={`ml-2 ${
                    tag === 'ai-generated' || tag === 'asisten'
                      ? 'text-orange-400 hover:text-orange-300'
                      : 'text-purple-400 hover:text-purple-300'
                  }`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <input
            type="text"
            name="title"
            value={note.title}
            onChange={handleInputChange}
            placeholder={isFromAI ? "Judul dari AI (bisa diedit)..." : "Judul catatan..."}
            className="w-full px-6 py-4 text-2xl md:text-3xl font-bold bg-gray-800/30 border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-300 placeholder-gray-500"
          />
        </div>

        <div className="bg-gray-800/30 rounded-2xl border border-gray-700/50 overflow-hidden">
          <textarea
            name="content"
            value={note.content}
            onChange={handleInputChange}
            placeholder={isFromAI ? "Konten dari Asisten AI (bisa diedit)..." : "Mulai menulis catatan Anda di sini... (Markdown didukung)"}
            className="w-full px-6 py-4 bg-transparent border-none focus:outline-none resize-none min-h-[400px] text-gray-300 placeholder-gray-500"
            rows={15}
          />
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-gray-700/50">
          <div className="text-sm text-gray-400">
            <span>{note.content.length} karakter • {calculateWordCount(note.content)} kata</span>
            {isFromAI && (
              <span className="ml-4 text-orange-400">
                ✨ Dihasilkan oleh AI
              </span>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/notes')}
              className="px-6 py-3 border border-gray-700/50 text-gray-300 hover:bg-gray-800/30 rounded-xl transition-colors"
              disabled={saving}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : isFromAI ? 'Simpan Catatan AI' : 'Simpan Catatan'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}