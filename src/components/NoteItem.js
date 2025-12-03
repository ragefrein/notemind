'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function NoteItem({ note, onSelect, onDelete }) {
  const [sedangMenghapus, setSedangMenghapus] = useState(false)

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (!confirm('Apakah Anda yakin ingin menghapus catatan ini?')) return

    setSedangMenghapus(true)
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', note.id)

      if (error) throw error
      onDelete()
    } catch (error) {
      console.error('Error menghapus catatan:', error)
      alert('Gagal menghapus catatan')
    } finally {
      setSedangMenghapus(false)
    }
  }

  const formatTanggal = (tanggalString) => {
    return new Date(tanggalString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div
      onClick={onSelect}
      className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-800 truncate">{note.title}</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {formatTanggal(note.updated_at)}
          </span>
          <button
            onClick={handleDelete}
            disabled={sedangMenghapus}
            className="text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded hover:bg-red-50"
          >
            {sedangMenghapus ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
      <p className="text-gray-600 text-sm line-clamp-2">
        {note.content}
      </p>
    </div>
  )
}