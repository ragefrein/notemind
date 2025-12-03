'use client'

import { useState, useEffect, useRef } from 'react'
import AuthForm from '@/components/AuthForm'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const typingTimeoutRef = useRef(null)

  const titleWords = ['Catatan', 'Ide', 'Pikiran', 'Inspirasi', 'Memori']
  const title = 'MindNote'

  useEffect(() => {
    const typeAnimation = () => {
      const currentWord = titleWords[currentWordIndex]
      
      if (typedText.length < currentWord.length) {
        setTimeout(() => {
          setTypedText(prev => currentWord.substring(0, prev.length + 1))
        }, 100)
      } else {
        setIsTyping(false)
        setTimeout(() => {
          if (currentWordIndex === titleWords.length - 1) {
            setCurrentWordIndex(0)
          } else {
            setCurrentWordIndex(prev => prev + 1)
          }
          setTypedText('')
          setIsTyping(true)
        }, 1500)
      }
    }

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(typeAnimation, 150)
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [typedText, isTyping, currentWordIndex, titleWords])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mb-4">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift">
                {title}
              </span>
            </h1>
          </div>
          
          <div className="h-12 flex items-center justify-center mb-4">
            <div className="relative">
              <span className="text-xl md:text-2xl font-medium text-gray-300">
                Tempat untuk segala{' '}
                <span className="font-semibold text-white">
                  {typedText}
                  <span className={`inline-block w-[2px] h-6 ml-1 bg-purple-400 ${isTyping ? 'animate-pulse' : 'opacity-0'}`}></span>
                </span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl">
          <AuthForm isSignUp={isSignUp} />

        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-800/20 rounded-xl border border-gray-700/30 text-center">
            <div className="text-2xl mb-2">🔒</div>
            <p className="text-sm text-gray-300">Aman & Terenkripsi</p>
          </div>
          <div className="p-4 bg-gray-800/20 rounded-xl border border-gray-700/30 text-center">
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-sm text-gray-300">Cepat & Responsif</p>
          </div>
          <div className="p-4 bg-gray-800/20 rounded-xl border border-gray-700/30 text-center col-span-2 md:col-span-1">
            <div className="text-2xl mb-2">🤖</div>
            <p className="text-sm text-gray-300">Asisten AI</p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Made with ❤️ for better note taking experience
          </p>
          <p className="text-gray-600 text-xs mt-2">
            v1.0 • 2025
          </p>
        </div>
      </div>

      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
      </div>

      <style jsx global>{`
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-shift {
          animation: gradient-shift 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}