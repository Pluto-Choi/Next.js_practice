"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { rankBadgeStyle } from "../lib/format";

export type TickerItem = { word: string; text: string; rank: number };

// 급상승 키워드를 한 줄씩 일정 시간마다 자동으로 넘기는 티커.
// 키워드 문구(헤드라인)만 깔끔하게 노출하고, 호버/포커스 시 멈춘다.
// 동작 최소화 설정(prefers-reduced-motion)에선 자동 전환을 끈다.
export default function RisingTicker({ items }: { items: TickerItem[] }) {
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (items.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (!pausedRef.current) setActive((p) => (p + 1) % items.length);
    }, 4000);
    return () => clearInterval(id);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div
      className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      onFocusCapture={() => (pausedRef.current = true)}
      onBlurCapture={() => (pausedRef.current = false)}
    >
      <div className="relative h-[88px] sm:h-20">
        {items.map((it, idx) => (
          <Link
            key={it.word}
            href={`/keyword/${encodeURIComponent(it.word)}`}
            aria-hidden={idx !== active}
            tabIndex={idx === active ? 0 : -1}
            className={`absolute inset-0 flex items-center gap-3 px-4 sm:px-5 transition-opacity duration-500 ${
              idx === active ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <span
              className={`text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-md shrink-0 tabular-nums ${rankBadgeStyle(
                it.rank
              )}`}
            >
              {it.rank}
            </span>
            <span className="text-base sm:text-lg font-semibold leading-snug line-clamp-2 break-keep tracking-tight">
              {it.text}
            </span>
          </Link>
        ))}
      </div>

      {items.length > 1 && (
        <div
          className="flex items-center justify-center gap-1.5 pb-3 pt-0.5"
          role="tablist"
          aria-label="급상승 키워드 선택"
        >
          {items.map((it, idx) => (
            <button
              key={it.word}
              type="button"
              role="tab"
              aria-selected={idx === active}
              aria-label={`${idx + 1}번째 급상승 키워드`}
              onClick={() => setActive(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === active
                  ? "w-5 bg-blue-500"
                  : "w-1.5 bg-zinc-300 dark:bg-zinc-600 hover:bg-zinc-400 dark:hover:bg-zinc-500"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
