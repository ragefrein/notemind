'use client'

import { useState, useEffect } from 'react'
import StatsCard from './StatsCard'

export default function MobileStatsCarousel({ stats }) {
  const [slideSaatIni, setSlideSaatIni] = useState(0)
  const [sentuhMulai, setSentuhMulai] = useState(null)
  const [sentuhSelesai, setSentuhSelesai] = useState(null)

  const statsArray = [
    {
      judul: "Total Catatan",
      nilai: stats.totalNotes,
      ikon: "📝",
      warna: "from-blue-500 to-cyan-500",
      tren: `+${Math.floor(stats.totalNotes * 0.1)}`
    },
    {
      judul: "Hari Ini",
      nilai: stats.todayNotes,
      ikon: "⚡",
      warna: "from-green-500 to-emerald-500",
      tren: `+${stats.todayNotes}`
    },
    {
      judul: "Favorit",
      nilai: stats.favoriteNotes,
      ikon: "⭐",
      warna: "from-yellow-500 to-orange-500",
      tren: `+${Math.floor(stats.favoriteNotes * 0.2)}`
    },
    {
      judul: "Disematkan",
      nilai: stats.pinnedNotes,
      ikon: "📌",
      warna: "from-purple-500 to-pink-500",
      tren: `+${Math.floor(stats.pinnedNotes * 0.15)}`
    },
    {
      judul: "Total Kata",
      nilai: stats.totalWords.toLocaleString(),
      ikon: "📖",
      warna: "from-indigo-500 to-blue-500",
      tren: `+${Math.floor(stats.totalWords * 0.05).toLocaleString()}`
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideSaatIni((prev) => (prev + 1) % statsArray.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [statsArray.length])

  const handleTouchStart = (e) => {
    setSentuhMulai(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setSentuhSelesai(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!sentuhMulai || !sentuhSelesai) return
    
    const jarak = sentuhMulai - sentuhSelesai
    const geserKiri = jarak > 50
    const geserKanan = jarak < -50

    if (geserKiri) {
      setSlideSaatIni((prev) => (prev + 1) % statsArray.length)
    } else if (geserKanan) {
      setSlideSaatIni((prev) => (prev - 1 + statsArray.length) % statsArray.length)
    }
    
    setSentuhMulai(null)
    setSentuhSelesai(null)
  }

  const pilihSlide = (index) => {
    setSlideSaatIni(index)
  }

  const slideBerikutnya = () => {
    setSlideSaatIni((prev) => (prev + 1) % statsArray.length)
  }

  const slideSebelumnya = () => {
    setSlideSaatIni((prev) => (prev - 1 + statsArray.length) % statsArray.length)
  }

  return (
    <div className="relative">
      <div 
        className="overflow-hidden rounded-2xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${slideSaatIni * 100}%)` }}
        >
          {statsArray.map((stat, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <StatsCard
                title={stat.judul}
                value={stat.nilai}
                icon={stat.ikon}
                color={stat.warna}
                trend={stat.tren}
                compact={true}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={slideSebelumnya}
          className="p-2 bg-gray-800/50 rounded-full hover:bg-gray-700/50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div className="flex items-center space-x-2">
          {statsArray.map((_, index) => (
            <button
              key={index}
              onClick={() => pilihSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                slideSaatIni === index 
                  ? 'w-8 bg-purple-500' 
                  : 'w-2 bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Ke slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={slideBerikutnya}
          className="p-2 bg-gray-800/50 rounded-full hover:bg-gray-700/50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="text-center mt-2 text-sm text-gray-400">
        {slideSaatIni + 1} / {statsArray.length}
      </div>
    </div>
  )
}