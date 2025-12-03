'use client'

import { useState, useEffect } from 'react'
import { supabase, getCurrentUser, handleSupabaseError } from '@/lib/supabase'

export const useNotes = () => {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchNotes = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const user = await getCurrentUser()
      if (!user) {
        setNotes([])
        return
      }

      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(100)

      if (fetchError) throw fetchError
      setNotes(data || [])
    } catch (err) {
      const errorMessage = handleSupabaseError(err, 'Failed to fetch notes')
      setError(errorMessage)
      console.error('Error fetching notes:', err)
    } finally {
      setLoading(false)
    }
  }

  const createNote = async (noteData) => {
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error: createError } = await supabase
        .from('notes')
        .insert([{
          ...noteData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single()

      if (createError) throw createError
      
      setNotes(prev => [data, ...prev])
      return { success: true, data }
    } catch (err) {
      const errorMessage = handleSupabaseError(err, 'Failed to create note')
      console.error('Error creating note:', err)
      return { success: false, error: errorMessage }
    }
  }

  const updateNote = async (id, updates) => {
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error: updateError } = await supabase
        .from('notes')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError
      
      setNotes(prev => prev.map(note => 
        note.id === id ? { ...note, ...data } : note
      ))
      
      return { success: true, data }
    } catch (err) {
      const errorMessage = handleSupabaseError(err, 'Failed to update note')
      console.error('Error updating note:', err)
      return { success: false, error: errorMessage }
    }
  }

  const deleteNote = async (id) => {
    try {
      const user = await getCurrentUser()
      if (!user) throw new Error('User not authenticated')

      const { error: deleteError } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (deleteError) throw deleteError
      
      setNotes(prev => prev.filter(note => note.id !== id))
      return { success: true }
    } catch (err) {
      const errorMessage = handleSupabaseError(err, 'Failed to delete note')
      console.error('Error deleting note:', err)
      return { success: false, error: errorMessage }
    }
  }

  const toggleFavorite = async (id, currentValue) => {
    return updateNote(id, { is_favorite: !currentValue })
  }

  const togglePin = async (id, currentValue) => {
    return updateNote(id, { is_pinned: !currentValue })
  }

  // Subscribe to realtime updates
  useEffect(() => {
    fetchNotes()

    const channel = supabase
      .channel('notes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
        },
        (payload) => {
          console.log('Realtime update:', payload)
          fetchNotes() // Refresh notes on change
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return {
    notes,
    loading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    toggleFavorite,
    togglePin,
  }
}