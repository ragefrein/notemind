'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import AIChatModal from './AIChatModal'

export default function QuickActions() {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const actions = [
    {
      title: 'Catatan Baru',
      description: 'Mulai menulis catatan baru',
      icon: '📝',
      color: 'from-blue-500 to-cyan-500',
      action: () => router.push('/notes/new')
    },
    {
      title: 'Lihat Semua',
      description: 'Telusuri semua catatan Anda',
      icon: '📚',
      color: 'from-purple-500 to-pink-500',
      action: () => router.push('/notes')
    },
    {
      title: 'Asisten AI',
      description: 'Dapatkan saran menulis',
      icon: '🤖',
      color: 'from-orange-500 to-red-500',
      action: () => setShowAIModal(true)
    },
  ]

  if (isMobile) {
    return (
      <>
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50">
          <h2 className="text-lg font-semibold mb-4">Aksi Cepat</h2>
          
          <div className="grid grid-cols-2 gap-3">
            {actions.map((action) => (
              <button
                key={action.title}
                onClick={action.action}
                className="group"
              >
                <div className="flex flex-col items-center justify-center p-4 bg-gray-800/20 hover:bg-gray-700/30 rounded-xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-200">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} mb-3`}>
                    <span className="text-2xl">{action.icon}</span>
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium text-sm group-hover:text-purple-300 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">Tag Populer</h3>
            <div className="flex flex-wrap gap-2">
              {['Pekerjaan', 'Pribadi', 'Ide', 'Rapat', 'Tugas', 'Proyek'].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 bg-purple-500/10 text-purple-300 rounded-lg text-xs border border-purple-500/20 hover:border-purple-500/40 transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <AIChatModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} />
      </>
    )
  }

  return (
    <>
      <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <h2 className="text-xl font-semibold mb-6">Aksi Cepat</h2>
        <div className="space-y-4">
          {actions.map((action) => (
            <button
              key={action.title}
              onClick={action.action}
              className="w-full group"
            >
              <div className="flex items-center p-4 bg-gray-800/20 hover:bg-gray-700/30 rounded-xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-200">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} mr-4`}>
                  <span className="text-2xl">{action.icon}</span>
                </div>
                <div className="text-left">
                  <h3 className="font-medium group-hover:text-purple-300 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-400">{action.description}</p>
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <AIChatModal isOpen={showAIModal} onClose={() => setShowAIModal(false)} />
    </>
  )
}