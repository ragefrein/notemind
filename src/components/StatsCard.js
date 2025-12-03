'use client'

import { useState, useEffect } from 'react'

export default function StatsCard({ title, value, icon, color, trend, compact = false, cached = false }) {
  const [isCached, setIsCached] = useState(cached)
  const [showCacheBadge, setShowCacheBadge] = useState(false)

  useEffect(() => {
    if (cached) {
      setShowCacheBadge(true)
      const timer = setTimeout(() => {
        setShowCacheBadge(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [cached])

  if (compact) {
    return (
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 relative">
        {showCacheBadge && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
            Tersimpan
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
            <span className="text-2xl">{icon}</span>
          </div>
        </div>
        <div className="flex items-center text-xs mt-3">
          <span className="text-green-400 flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            {trend}
          </span>
          <span className="text-gray-400 ml-2">dari minggu lalu</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 group hover:scale-[1.02] relative">
      {showCacheBadge && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
          Tersimpan
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
      <div className="flex items-center text-sm">
        <span className="text-green-400 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          {trend}
        </span>
        <span className="text-gray-400 ml-2">dari minggu lalu</span>
      </div>
    </div>
  )
}