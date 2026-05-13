'use client'

import { useEffect, useState } from 'react'

type State = 'hidden' | 'installable' | 'ios' | 'ios-guide'

const benefits = [
  { icon: '⚡', text: '빠른 실행' },
  { icon: '📲', text: '홈 화면 바로가기' },
  { icon: '🖥️', text: '앱처럼 전체화면' },
]

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

  const handleInstall = async () => {
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
      <div className="mb-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <div className="px-4 pt-4 pb-3">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-3">이렇게 설치하세요</p>
          <ol className="flex flex-col gap-2.5">
            {[
              { step: '1', desc: 'Safari 하단 공유 버튼 탭', icon: '□↑' },
              { step: '2', desc: '\'홈 화면에 추가\' 선택', icon: '＋' },
              { step: '3', desc: '\'추가\' 버튼 탭', icon: '✓' },
            ].map(({ step, desc, icon }) => (
              <li key={step} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-bold flex items-center justify-center shrink-0">{step}</span>
                <span className="text-xs text-zinc-600 dark:text-zinc-400 flex-1">{desc}</span>
                <span className="text-base leading-none">{icon}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-2.5 flex justify-between items-center">
          <span className="text-xs text-zinc-400">Safari에서만 설치 가능해요</span>
          <button onClick={() => setState('ios')} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">닫기</button>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-5 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">앱으로 설치하기</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">더 빠르고 편하게 뉴스 확인</p>
          </div>
          <button onClick={() => setState('hidden')} className="text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors text-sm leading-none mt-0.5">✕</button>
        </div>
        <div className="flex gap-3 mb-4">
          {benefits.map(({ icon, text }) => (
            <div key={text} className="flex-1 flex flex-col items-center gap-1 bg-zinc-50 dark:bg-zinc-800 rounded-xl py-2.5">
              <span className="text-lg leading-none">{icon}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium text-center leading-tight">{text}</span>
            </div>
          ))}
        </div>
        <button
          onClick={handleInstall}
          className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-semibold hover:bg-zinc-700 dark:hover:bg-zinc-100 transition-colors active:scale-[0.98]"
        >
          설치하기
        </button>
      </div>
      {state === 'ios' && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-2.5">
          <button
            onClick={() => setState('ios-guide')}
            className="w-full text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors text-center"
          >
            iPhone이라면? 설치 방법 보기 →
          </button>
        </div>
      )}
    </div>
  )
}
