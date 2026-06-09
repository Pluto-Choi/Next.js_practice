'use client'

import { useState } from 'react'

export default function ShareButton({ topKeyword }: { topKeyword?: string }) {
  const [state, setState] = useState<'idle' | 'done'>('idle')

  const handleShare = async () => {
    const title = '오늘의 뉴스 👀'
    const text = topKeyword
      ? `🔥 오늘 1위 「${topKeyword}」\n지금 대한민국이 가장 주목한 키워드 TOP5, 같이 봐요 👇`
      : '오늘 대한민국이 가장 주목한 키워드 TOP5\n같이 확인해봐 👇'
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
        setState('done')
        setTimeout(() => setState('idle'), 2000)
      } catch {}
    } else {
      await navigator.clipboard.writeText(`${text}\n\n👉 ${url}`)
      setState('done')
      setTimeout(() => setState('idle'), 2000)
    }
  }

  return (
    <div className="flex justify-center mt-5 mb-1">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/60 shadow-sm text-sm font-semibold text-violet-600 dark:text-violet-300 hover:border-violet-400 dark:hover:border-violet-600 transition-all active:scale-95"
      >
        {state === 'done' ? (
          <>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <path d="M2 7.5L6 11.5L13 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>공유됨</span>
          </>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <circle cx="11.5" cy="2.5" r="1.8" stroke="currentColor" strokeWidth="1.4"/>
              <circle cx="11.5" cy="12.5" r="1.8" stroke="currentColor" strokeWidth="1.4"/>
              <circle cx="2.5" cy="7.5" r="1.8" stroke="currentColor" strokeWidth="1.4"/>
              <line x1="10.1" y1="3.3" x2="3.9" y2="6.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <line x1="3.9" y1="8.3" x2="10.1" y2="11.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <span>공유하기</span>
          </>
        )}
      </button>
    </div>
  )
}
