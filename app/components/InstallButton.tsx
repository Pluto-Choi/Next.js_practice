'use client'

import { useEffect, useState } from 'react'

type State = 'hidden' | 'installable' | 'ios' | 'ios-guide'

const INSTALLED_KEY = 'pwa-installed'

const benefits = [
  { icon: '⚡', text: '빠른 실행' },
  { icon: '📲', text: '홈 화면 바로가기' },
  { icon: '🖥️', text: '앱처럼 전체화면' },
]

export default function InstallButton() {
  const [state, setState] = useState<State>('hidden')
  const [prompt, setPrompt] = useState<Event & { prompt(): void; userChoice: Promise<{ outcome: string }> } | null>(null)

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true

    // 설치된 앱으로 열었으면 그 사실을 기억해두고 카드를 숨긴다.
    if (standalone) {
      try { localStorage.setItem(INSTALLED_KEY, '1') } catch {}
      return
    }
    // 한 번이라도 설치된 앱을 연 적 있으면 브라우저 탭에서도 더는 띄우지 않는다.
    try { if (localStorage.getItem(INSTALLED_KEY)) return } catch {}

    const onInstalled = () => {
      try { localStorage.setItem(INSTALLED_KEY, '1') } catch {}
      setState('hidden')
    }
    window.addEventListener('appinstalled', onInstalled)

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    if (isIOS) {
      setState('ios')
      return () => window.removeEventListener('appinstalled', onInstalled)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as Event & { prompt(): void; userChoice: Promise<{ outcome: string }> })
      setState('installable')
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', onInstalled)
    }
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
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Safari에서만 설치 가능해요</span>
          <button onClick={() => setState('ios')} className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">닫기</button>
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
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">더 빠르고 편하게 뉴스 확인</p>
          </div>
          <button onClick={() => setState('hidden')} className="text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400 transition-colors text-sm leading-none mt-0.5">✕</button>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4">
          {benefits.map(({ icon, text }) => (
            <span key={text} className="inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
              <span className="text-sm leading-none">{icon}</span>
              {text}
            </span>
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
            className="w-full text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors text-center"
          >
            iPhone이라면? 설치 방법 보기 →
          </button>
        </div>
      )}
    </div>
  )
}
