'use client'

import { useEffect, useState } from 'react'

type State = 'hidden' | 'installable' | 'ios' | 'ios-guide'

export default function InstallButton() {
  const [state, setState] = useState<State>('hidden')
  const [prompt, setPrompt] = useState<Event & { prompt(): void; userChoice: Promise<{ outcome: string }> } | null>(null)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    if (isIOS) {
      setState('ios')
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as Event & { prompt(): void; userChoice: Promise<{ outcome: string }> })
      setState('installable')
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleClick = async () => {
    if (state === 'ios') {
      setState('ios-guide')
      return
    }
    if (prompt) {
      prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === 'accepted') setState('hidden')
      setPrompt(null)
    }
  }

  if (state === 'hidden') return null

  if (state === 'ios-guide') {
    return (
      <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-4 py-2.5 mb-4">
        <span>Safari</span>
        <span>→</span>
        <span className="text-lg leading-none">□↑</span>
        <span>→</span>
        <span className="font-medium text-zinc-700 dark:text-zinc-300">홈 화면에 추가</span>
        <button onClick={() => setState('ios')} className="ml-2 text-zinc-400 hover:text-zinc-600">✕</button>
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 mx-auto mb-4 px-4 py-2 rounded-full text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all shadow-sm"
    >
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <path d="M6.5 1v7M3.5 5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M1 9v1.5A1.5 1.5 0 002.5 12h8A1.5 1.5 0 0012 10.5V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
      앱으로 설치
    </button>
  )
}
