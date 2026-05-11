'use client'

import { useState } from 'react'

export default function ShareButton({ category }: { category: string }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: `오늘의 뉴스 - ${category}`,
          text: `${category} 키워드 트렌드를 확인해보세요`,
          url,
        })
      } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="shrink-0 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
      aria-label={`${category} 공유`}
    >
      {copied ? '✓ 복사됨' : '공유'}
    </button>
  )
}
