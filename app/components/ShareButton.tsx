'use client'

import { useState } from 'react'

interface Props {
  category: string
  summary: string
  keywords: { rank: number; word: string }[]
  date: string
}

export default function ShareButton({ category, summary, keywords, date }: Props) {
  const [state, setState] = useState<'idle' | 'done'>('idle')

  const handleShare = async () => {
    const emoji = category === '오늘의 이슈' ? '🔥' : '💰'
    const keywordLines = keywords.map(k => `${k.rank}위 ${k.word}`).join('\n')
    const text = `${emoji} ${category} (${date})\n\n${keywordLines}\n\n🤖 ${summary}`
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title: `오늘의 뉴스 - ${category}`, text, url })
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
        className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all active:scale-95"
      >
        {state === 'done' ? (
          <>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M2 7.5L6 11.5L13 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>공유됨</span>
          </>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
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
