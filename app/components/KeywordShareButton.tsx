"use client";

import { useState } from "react";

export default function KeywordShareButton({ word }: { word: string }) {
  const [done, setDone] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    // <summary> 안에 있으므로 클릭이 details 토글로 번지지 않게 막는다.
    e.preventDefault();
    e.stopPropagation();
    const text = `오늘의 뉴스 키워드 '${word}' 🔥`;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: text, text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n👉 ${url}`);
      }
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={`${word} 공유하기`}
      className="p-1 rounded-full text-zinc-300 hover:text-zinc-500 dark:text-zinc-600 dark:hover:text-zinc-400 transition-colors shrink-0"
    >
      {done ? (
        <svg width="14" height="14" viewBox="0 0 15 15" fill="none" aria-hidden="true">
          <path d="M2 7.5L6 11.5L13 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 15 15" fill="none" aria-hidden="true">
          <circle cx="11.5" cy="2.5" r="1.8" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="11.5" cy="12.5" r="1.8" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="2.5" cy="7.5" r="1.8" stroke="currentColor" strokeWidth="1.4" />
          <line x1="10.1" y1="3.3" x2="3.9" y2="6.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <line x1="3.9" y1="8.3" x2="10.1" y2="11.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
