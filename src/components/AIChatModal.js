'use client'

import { useState, useRef, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { useRouter } from 'next/navigation'

export default function AIChatModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Halo! Saya Asisten AI catatan Anda. Saya bisa membantu dengan:\n\n• Menyusun struktur catatan\n• Memberikan ide menulis\n• Mengedit dan memperbaiki teks\n• Menyarankan judul yang menarik\n• Meringkas catatan panjang\n\nAda yang bisa saya bantu?",
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [selectedResponse, setSelectedResponse] = useState(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const messagesEndRef = useRef(null)
  const router = useRouter()

  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !apiKey) return

    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setSelectedResponse(null)

    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 1,
          topP: 1,
          maxOutputTokens: 4096,
        },
      })

      const prompt = `Anda adalah asisten penulisan catatan yang membantu dalam bahasa Indonesia. 
      Tugas Anda adalah membantu pengguna dengan segala hal terkait penulisan catatan.
      
      Permintaan pengguna: "${input}"
      
      Berikan respons yang:
      1. Dalam bahasa Indonesia
      2. Fokus pada penulisan catatan
      3. Praktis dan dapat diterapkan
      4. Jelas dan terstruktur
      5. Siap untuk digunakan sebagai catatan
      
      Format respons: Berikan dalam format yang mudah disalin dan digunakan langsung sebagai catatan.
      Jika relevan, sertakan judul yang sesuai untuk catatan tersebut.`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      const aiMessage = {
        id: messages.length + 2,
        text: text,
        sender: 'ai',
        timestamp: new Date(),
        canBeImported: true
      }

      setMessages(prev => [...prev, aiMessage])
      setSelectedResponse(text)
      
    } catch (error) {
      console.error('Error calling Gemini API:', error)
      
      let errorMessageText = "Maaf, terjadi kesalahan saat menghubungi AI.\n\n"
      
      if (error.message.includes('404') || error.message.includes('not found')) {
        errorMessageText += `Model tidak ditemukan.\n`
        errorMessageText += "Silakan periksa API Key Anda atau coba lagi nanti.\n\n"
      } else if (error.message.includes('API key')) {
        errorMessageText += "API Key tidak valid atau tidak ada. Periksa NEXT_PUBLIC_GEMINI_API_KEY di .env.local\n\n"
      } else if (error.message.includes('quota')) {
        errorMessageText += "Kuota API telah habis. Periksa kuota Anda di Google AI Studio.\n\n"
      } else {
        errorMessageText += "Error: " + (error.message || 'Unknown error')
      }

      const errorMessage = {
        id: messages.length + 2,
        text: errorMessageText,
        sender: 'ai',
        timestamp: new Date(),
        canBeImported: false
      }

      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const quickSuggestions = [
    "Buatkan outline untuk catatan meeting",
    "Bagaimana cara menulis catatan yang efektif?",
    "Saran judul untuk catatan tentang ide startup",
    "Edit dan perbaiki teks ini: ...",
    "Buatkan ringkasan dari catatan panjang",
    "Struktur catatan untuk laporan proyek",
    "Tips menulis catatan harian",
    "Contoh catatan untuk brainstorming ide"
  ]

  const handleImportToNote = async () => {
    if (!selectedResponse) return
    
    setIsImporting(true)
    
    try {
      const noteContent = {
        title: extractTitleFromResponse(selectedResponse),
        content: selectedResponse,
        category: 'learning',
        tags: ['ai-generated', 'asisten']
      }
      
      localStorage.setItem('ai_generated_note', JSON.stringify(noteContent))
      router.push('/notes/new?from=ai')
      onClose()
      
    } catch (error) {
      console.error('Error importing to note:', error)
      alert('Gagal mengimpor catatan. Silakan coba lagi.')
    } finally {
      setIsImporting(false)
    }
  }

  const extractTitleFromResponse = (text) => {
    const lines = text.split('\n')
    for (let line of lines) {
      if (line.startsWith('# ') || line.startsWith('## ')) {
        return line.replace(/^#+\s*/, '').trim()
      }
      if (line.includes('Judul:') || line.includes('Title:')) {
        return line.split(':')[1]?.trim() || 'Catatan dari AI'
      }
    }
    const firstLine = lines[0].trim()
    if (firstLine.length > 50) {
      return firstLine.substring(0, 50) + '...'
    }
    
    return firstLine || 'Catatan dari AI'
  }

  const handleCopyToClipboard = async () => {
    if (!selectedResponse) return
    
    try {
      await navigator.clipboard.writeText(selectedResponse)
      // Show custom success message
      setShowCustomAlert({
        show: true,
        message: 'Respons berhasil disalin ke clipboard!',
        type: 'success'
      })
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      setShowCustomAlert({
        show: true,
        message: 'Gagal menyalin ke clipboard.',
        type: 'error'
      })
    }
  }

  const handleClearChat = () => {
    setShowClearConfirm(true)
  }

  const confirmClearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Halo! Saya Asisten AI catatan Anda. Saya bisa membantu dengan:\n\n• Menyusun struktur catatan\n• Memberikan ide menulis\n• Mengedit dan memperbaiki teks\n• Menyarankan judul yang menarik\n• Meringkas catatan panjang\n\nAda yang bisa saya bantu?",
        sender: 'ai',
        timestamp: new Date(),
        canBeImported: false
      }
    ])
    setSelectedResponse(null)
    setShowClearConfirm(false)
  }

  const cancelClearChat = () => {
    setShowClearConfirm(false)
  }

  const [showCustomAlert, setShowCustomAlert] = useState({ show: false, message: '', type: 'success' })

  useEffect(() => {
    if (showCustomAlert.show) {
      const timer = setTimeout(() => {
        setShowCustomAlert({ show: false, message: '', type: 'success' })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showCustomAlert.show])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Konfirmasi Hapus Chat */}
      {showClearConfirm && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="absolute inset-0 bg-black/70" onClick={cancelClearChat}></div>
          <div className="relative bg-gray-900 rounded-2xl p-6 max-w-md w-full border border-gray-700/50">
            <div className="flex items-start mb-4">
              <div className="p-3 rounded-xl bg-red-500/20 mr-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Hapus Percakapan</h3>
                <p className="text-gray-300">Apakah Anda yakin ingin menghapus semua percakapan? Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelClearChat}
                className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmClearChat}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl border border-red-500/30 transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert */}
      {showCustomAlert.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`px-4 py-3 rounded-xl border backdrop-blur-sm shadow-lg ${
            showCustomAlert.type === 'success' 
              ? 'bg-green-500/20 border-green-500/30 text-green-300'
              : 'bg-red-500/20 border-red-500/30 text-red-300'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-lg">
                {showCustomAlert.type === 'success' ? '✅' : '❌'}
              </span>
              <p className="font-medium">{showCustomAlert.message}</p>
              <button
                onClick={() => setShowCustomAlert({ show: false, message: '', type: 'success' })}
                className="ml-4 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 rounded-2xl w-full max-w-6xl h-[95vh] flex flex-col border border-gray-700/50 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Asisten AI Catatan</h2>
              <p className="text-sm text-gray-400">
                {apiKey ? 
                  "Ditenagai oleh Gemini Flash - Cepat & Responsif" : 
                  "API Key belum dikonfigurasi"
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {selectedResponse && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyToClipboard}
                  className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm border border-blue-500/30 transition-colors"
                  title="Salin ke clipboard"
                >
                  Salin
                </button>
                <button
                  onClick={handleImportToNote}
                  disabled={isImporting}
                  className="px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-sm border border-green-500/30 transition-colors disabled:opacity-50"
                  title="Impor sebagai catatan baru"
                >
                  {isImporting ? 'Mengimpor...' : 'Impor ke Catatan'}
                </button>
              </div>
            )}
            <button
              onClick={handleClearChat}
              className="px-3 py-1.5 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-lg text-sm border border-gray-700/50 transition-colors"
              title="Hapus percakapan"
            >
              Hapus Chat
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col">
            <div className="p-4 bg-gray-800/30 border-b border-gray-700/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">Saran Cepat</h3>
                <span className="text-xs text-green-400">⚡ Model cepat</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(suggestion)}
                    disabled={!apiKey}
                    className="px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-lg text-sm border border-gray-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6 max-w-4xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl p-4 ${
                        message.sender === 'user'
                          ? 'bg-purple-500/20 border border-purple-500/30'
                          : 'bg-gray-800/50 border border-gray-700/50'
                      } ${message.canBeImported ? 'hover:border-green-500/30 cursor-pointer' : ''}`}
                      onClick={() => message.canBeImported && setSelectedResponse(message.text)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                            message.sender === 'user' 
                              ? 'bg-purple-500' 
                              : 'bg-gradient-to-br from-orange-500 to-red-500'
                          }`}>
                            {message.sender === 'user' ? '👤' : '🤖'}
                          </div>
                          <span className="text-sm font-medium">
                            {message.sender === 'user' ? 'Anda' : 'Asisten AI'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {message.canBeImported && selectedResponse === message.text && (
                            <span className="ml-2 text-green-400">✓ Dipilih</span>
                          )}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap prose prose-invert max-w-none">
                        {message.text}
                      </div>
                      {message.canBeImported && (
                        <div className="mt-3 pt-3 border-t border-gray-700/30">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedResponse(message.text)
                            }}
                            className={`px-3 py-1 text-xs rounded ${
                              selectedResponse === message.text
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                            } transition-colors`}
                          >
                            {selectedResponse === message.text ? '✓ Akan diimpor' : 'Pilih untuk diimpor'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[90%] rounded-2xl p-4 bg-gray-800/50 border border-gray-700/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                          <span className="text-lg">🤖</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-gray-400 mb-2">Sedang memproses...</div>
                          <div className="flex space-x-2">
                            <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
                            <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 border-t border-gray-700/50">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={apiKey ? "Tanya apapun tentang penulisan catatan..." : "API Key belum dikonfigurasi. Cek .env.local"}
                  disabled={!apiKey || isLoading}
                  className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading || !apiKey}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? 'Memproses...' : 'Kirim'}
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-gray-400">
                  {apiKey ? 
                    "Ditenagai oleh Gemini Flash - Hasil dapat langsung diimpor sebagai catatan" :
                    "Tambahkan NEXT_PUBLIC_GEMINI_API_KEY ke .env.local"
                  }
                </p>
                <div className="text-xs text-gray-400">
                  {selectedResponse && (
                    <span className="text-green-400">✓ Respons siap diimpor</span>
                  )}
                </div>
              </div>
            </form>
          </div>
          {selectedResponse && (
            <div className="w-80 border-l border-gray-700/50 bg-gray-900/50 p-6 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Impor ke Catatan</h3>
              
              <div className="mb-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                <h4 className="text-sm font-medium mb-2">Pratinjau</h4>
                <div className="text-sm text-gray-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {selectedResponse.length > 500 
                    ? selectedResponse.substring(0, 500) + '...' 
                    : selectedResponse}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {selectedResponse.length} karakter
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Judul Catatan</label>
                  <input
                    type="text"
                    value={extractTitleFromResponse(selectedResponse)}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Kategori</label>
                  <select 
                    className="w-full px-3 py-2 bg-gray-800/30 border border-gray-700/50 rounded-lg text-sm text-gray-300"
                    defaultValue="learning"
                  >
                    <option value="work">Pekerjaan</option>
                    <option value="personal">Pribadi</option>
                    <option value="ideas">Ide</option>
                    <option value="learning">Pembelajaran</option>
                    <option value="meeting">Rapat</option>
                    <option value="general">Umum</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleImportToNote}
                    disabled={isImporting}
                    className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {isImporting ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Mengimpor...</span>
                      </>
                    ) : (
                      <>
                        <span>📝</span>
                        <span>Buat Catatan Baru</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCopyToClipboard}
                    className="w-full px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 rounded-xl font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>📋</span>
                    <span>Salin ke Clipboard</span>
                  </button>

                  <button
                    onClick={() => setSelectedResponse(null)}
                    className="w-full px-4 py-3 bg-gray-800/30 hover:bg-gray-700/30 text-gray-400 rounded-xl font-medium transition-colors"
                  >
                    Batalkan Pilihan
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-700/50">
                  <p className="text-xs text-gray-400">
                    Catatan akan dibuat dengan konten AI-generated dan dapat diedit lebih lanjut di halaman catatan baru.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}