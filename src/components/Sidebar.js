'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

export default function Sidebar() {
  const [user, setUser] = useState(null)
  const [notesCount, setNotesCount] = useState(0)
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 1024)
    if (window.innerWidth < 1024) {
      setCollapsed(true) 
    }
  }
  
  checkMobile()
  window.addEventListener('resize', checkMobile)
  return () => window.removeEventListener('resize', checkMobile)
}, [])
  

  const navItems = [
    { name: 'Dashboard', icon: '📊', path: '/' },
    { name: 'All Notes', icon: '📝', path: '/notes' },
    { name: 'Favorites', icon: '⭐', path: '/favorites' },
    { name: 'Trash', icon: '🗑️', path: '/trash' },
  ]

  return (
    <div className={`${collapsed || isMobile ? 'w-16 lg:w-20' : 'w-64'} bg-gray-800/50 backdrop-blur-lg border-r border-gray-700/50 transition-all duration-300 flex flex-col fixed lg:relative h-screen z-40`}>
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-xl">📝</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Notion Lite
                </h1>
                <p className="text-xs text-gray-400">Smart Notes</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-xl">📝</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>
      </div>
      {user && !collapsed && (
        <div className="p-4 border-b border-gray-700/50">
          <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
              <span className="font-bold">{user.email?.[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.email}</p>
              <p className="text-xs text-gray-400">{notesCount} notes</p>
            </div>
          </div>
        </div>
      )}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${pathname === item.path
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-l-4 border-purple-500'
                    : 'hover:bg-gray-700/30'
                  }`}
              >
                <span className="text-xl">{item.icon}</span>
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
        {!collapsed && (
          <div className="mt-8">
            <h3 className="text-xs uppercase text-gray-400 font-semibold mb-3 px-3">
              Tags
            </h3>
            <div className="space-y-2">
              {['Personal', 'Work', 'Ideas', 'Learning'].map((tag) => (
                <button
                  key={tag}
                  className="flex items-center justify-between w-full p-2 hover:bg-gray-700/30 rounded-lg group"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">{tag}</span>
                  </div>
                  <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    3
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
      <div className="p-4 border-t border-gray-700/50">
        {!collapsed ? (
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center justify-center space-x-2 w-full p-3 bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 rounded-lg transition-all duration-200"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        ) : (
          <button
            onClick={() => supabase.auth.signOut()}
            className="w-12 h-12 mx-auto flex items-center justify-center bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 rounded-lg transition-all duration-200"
          >
            <span>🚪</span>
          </button>
        )}
      </div>
    </div>
  )
}