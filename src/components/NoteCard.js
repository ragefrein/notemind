'use client'

export default function NoteCard({ note, onEdit, onDelete, onToggleFavorite, onTogglePin }) {
  const formatTanggal = (tanggalString) => {
    const tanggal = new Date(tanggalString)
    const sekarang = new Date()
    const selisihWaktu = Math.abs(sekarang - tanggal)
    const selisihHari = Math.floor(selisihWaktu / (1000 * 60 * 60 * 24))
    
    if (selisihHari === 0) {
      return 'Hari ini'
    } else if (selisihHari === 1) {
      return 'Kemarin'
    } else if (selisihHari < 7) {
      return `${selisihHari} hari lalu`
    } else {
      return tanggal.toLocaleDateString('id-ID', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    }
  }

  const getWarnaKategori = (kategori) => {
    const warna = {
      work: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      personal: 'bg-green-500/20 text-green-300 border-green-500/30',
      ideas: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      learning: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      meeting: 'bg-red-500/20 text-red-300 border-red-500/30',
      general: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    }
    return warna[kategori] || warna.general
  }

  const getKelasWarna = (warnaCatatan) => {
    const warna = {
      purple: 'bg-purple-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      pink: 'bg-pink-500',
    }
    return warna[warnaCatatan] || warna.purple
  }

  const renderPratinjau = (teks) => {
    if (!teks) return 'Tidak ada konten'
    
    let pratinjau = teks
    
    pratinjau = pratinjau
      .replace(/#+\s/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/~~(.*?)~~/g, '$1')
      .replace(/!\[.*?\]\(.*?\)/g, '[Gambar]')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/```[\s\S]*?```/g, '[Kode]')
      .replace(/>\s/g, '')
    
    if (pratinjau.length > 150) {
      pratinjau = pratinjau.substring(0, 150) + '...'
    }
    
    return pratinjau
  }

  const getLabelKategori = (kategori) => {
    const label = {
      work: 'Pekerjaan',
      personal: 'Pribadi',
      ideas: 'Ide',
      learning: 'Pembelajaran',
      meeting: 'Rapat',
      general: 'Umum',
    }
    return label[kategori] || kategori
  }

  return (
    <div className="group relative bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 hover:scale-[1.02]">
      <div className={`absolute top-0 left-0 w-2 h-full rounded-l-2xl ${getKelasWarna(note.color)}`}></div>

      <div className="absolute top-4 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onTogglePin}
          className={`p-1.5 rounded-lg ${note.is_pinned
              ? 'text-yellow-400 bg-yellow-400/10'
              : 'text-gray-400 hover:bg-gray-700/50'
            } transition-colors`}
          title={note.is_pinned ? 'Lepas sematan' : 'Sematkan'}
        >
          <svg className="w-4 h-4" fill={note.is_pinned ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
        
        <button
          onClick={onToggleFavorite}
          className={`p-1.5 rounded-lg ${note.is_favorite
              ? 'text-yellow-400 bg-yellow-400/10'
              : 'text-gray-400 hover:bg-gray-700/50'
            } transition-colors`}
          title={note.is_favorite ? 'Hapus dari favorit' : 'Tambahkan ke favorit'}
        >
          <svg className="w-4 h-4" fill={note.is_favorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      </div>

      {note.is_favorite && (
        <div className="absolute top-4 left-4 text-yellow-400">
          ⭐
        </div>
      )}

      <div className="ml-4">
        <span className={`inline-block px-3 py-1 text-xs rounded-lg border ${getWarnaKategori(note.category)} mb-3`}>
          {getLabelKategori(note.category)}
        </span>

        <h3 
          onClick={onEdit}
          className="text-lg font-semibold mb-2 line-clamp-1 cursor-pointer hover:text-purple-300 transition-colors"
        >
          {note.title || 'Catatan Tanpa Judul'}
        </h3>

        <p className="text-gray-400 text-sm line-clamp-3 mb-4 cursor-pointer">
          {renderPratinjau(note.content)}
        </p>

        {Array.isArray(note.tags) && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {note.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-purple-500/10 text-purple-300 rounded border border-purple-500/20"
              >
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-700/50 text-gray-400 rounded">
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <span>{formatTanggal(note.updated_at)}</span>
            {note.word_count > 0 && (
              <span>{note.word_count} kata</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onDelete}
              className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
              title="Hapus catatan"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            
            <button
              onClick={onEdit}
              className="p-1.5 text-purple-400 hover:bg-purple-400/10 rounded-lg transition-colors"
              title="Edit catatan"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}