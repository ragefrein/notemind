'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'
import NoteCard from '@/components/NoteCard'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function NotesPage() {
  const [notes, setNotes] = useState([])
  const [filteredNotes, setFilteredNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('updated')
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false)
  const [showOnlyPinned, setShowOnlyPinned] = useState(false)
  const router = useRouter()

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'work', label: 'Work' },
    { value: 'personal', label: 'Personal' },
    { value: 'ideas', label: 'Ideas' },
    { value: 'learning', label: 'Learning' },
    { value: 'meeting', label: 'Meeting' },
  ]

  const sortOptions = [
    { value: 'updated', label: 'Last Updated' },
    { value: 'created', label: 'Date Created' },
    { value: 'title', label: 'Title' },
    { value: 'word_count', label: 'Word Count' },
  ]

  useEffect(() => {
    fetchNotes()
  }, [])

  useEffect(() => {
    filterAndSortNotes()
  }, [notes, search, category, sortBy, showOnlyFavorites, showOnlyPinned])

  const fetchNotes = async () => {
    try {
      setLoading(true)
      
      const user = await getCurrentUser()
      if (!user) {
        router.push('/auth')
        return
      }

      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Error fetching notes:', error)
      alert('Failed to load notes')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortNotes = () => {
    let filtered = [...notes]

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchLower) ||
        note.content.toLowerCase().includes(searchLower) ||
        (Array.isArray(note.tags) && note.tags.some(tag => 
          tag.toLowerCase().includes(searchLower)
        ))
      )
    }
    if (category !== 'all') {
      filtered = filtered.filter(note => note.category === category)
    }
    if (showOnlyFavorites) {
      filtered = filtered.filter(note => note.is_favorite)
    }
    if (showOnlyPinned) {
      filtered = filtered.filter(note => note.is_pinned)
    }
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return new Date(b.created_at) - new Date(a.created_at)
        case 'title':
          return a.title.localeCompare(b.title)
        case 'word_count':
          return (b.word_count || 0) - (a.word_count || 0)
        case 'updated':
        default:
          return new Date(b.updated_at) - new Date(a.updated_at)
      }
    })

    setFilteredNotes(filtered)
  }
  const handleDeleteNote = async (id) => {
    if (!confirm('Are you sure you want to delete this note?')) return
    try {
      const user = await getCurrentUser()
      if (!user) return

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      setNotes(prev => prev.filter(note => note.id !== id))
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Failed to delete note')
    }
  }

  const handleToggleFavorite = async (id, currentValue) => {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const { error } = await supabase
        .from('notes')
        .update({ is_favorite: !currentValue })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      setNotes(prev => prev.map(note =>
        note.id === id ? { ...note, is_favorite: !currentValue } : note
      ))
    } catch (error) {
      console.error('Error toggling favorite:', error)
      alert('Failed to update note')
    }
  }

  const handleTogglePin = async (id, currentValue) => {
    try {
      const user = await getCurrentUser()
      if (!user) return

      const { error } = await supabase
        .from('notes')
        .update({ is_pinned: !currentValue })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      setNotes(prev => prev.map(note =>
        note.id === id ? { ...note, is_pinned: !currentValue } : note
      ))
    } catch (error) {
      console.error('Error toggling pin:', error)
      alert('Failed to update note')
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">All Notes</h1>
          <button
            onClick={() => router.push('/notes/new')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
          >
            + Create New Note
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/30 border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${showOnlyFavorites
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                : 'bg-gray-800/30 text-gray-300 hover:bg-gray-700/30 border border-gray-700/50'
              }`}
          >
            ⭐ Favorites
          </button>
          <button
            onClick={() => setShowOnlyPinned(!showOnlyPinned)}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${showOnlyPinned
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-gray-800/30 text-gray-300 hover:bg-gray-700/30 border border-gray-700/50'
              }`}
          >
            📌 Pinned
          </button>
          <button
            onClick={() => {
              setShowOnlyFavorites(false)
              setShowOnlyPinned(false)
              setCategory('all')
              setSearch('')
            }}
            className="px-4 py-2 bg-gray-800/30 text-gray-300 hover:bg-gray-700/30 border border-gray-700/50 rounded-lg transition-all duration-200"
          >
            🔄 Clear Filters
          </button>
        </div>
      </div>
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/20 rounded-2xl border border-gray-700/50">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-xl font-medium mb-2">No notes found</h3>
          <p className="text-gray-400 mb-6">
            {search || category !== 'all' || showOnlyFavorites || showOnlyPinned
              ? 'Try changing your filters or search term'
              : 'Create your first note to get started'}
          </p>
          <button
            onClick={() => router.push('/notes/new')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-medium transition-all duration-200"
          >
            Create Your First Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={() => router.push(`/notes/${note.id}`)}
              onDelete={() => handleDeleteNote(note.id)}
              onToggleFavorite={() => handleToggleFavorite(note.id, note.is_favorite)}
              onTogglePin={() => handleTogglePin(note.id, note.is_pinned)}
            />
          ))}
        </div>
      )}
      <div className="mt-8 pt-6 border-t border-gray-700/50">
        <div className="flex justify-between items-center text-sm text-gray-400">
          <span>Showing {filteredNotes.length} of {notes.length} notes</span>
          <span>Total words: {notes.reduce((sum, note) => sum + (note.word_count || 0), 0).toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}