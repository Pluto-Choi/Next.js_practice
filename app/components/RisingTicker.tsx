"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type TickerItem = { word: string; text: string };

const VISIBLE = 3;
const ROW = 48; // px. 한 줄 행 높이 — translateY 계산과 일치해야 한다.

// 급상승 키워드를 한 번에 3줄씩 보여주고, 일정 시간마다 한 줄씩 위로 넘기는 세로 티커.
// 앞뒤로 클론을 덧대 끊김 없이 순환한다. 호버/포커스 시 멈추고,
// 동작 최소화 설정(prefers-reduced-motion)에선 자동 전환을 끈다.
export default function RisingTicker({ items }: { items: TickerItem[] }) {
  const N = items.length;
  const canScroll = N > VISIBLE;
  const [idx, setIdx] = useState(VISIBLE);
  const [anim, setAnim] = useState(true);
  const pausedRef = useRef(false);

  // [마지막 VISIBLE개 클론][실제 0..N-1][처음 VISIBLE개 클론]
  const list = canScroll
    ? [...items.slice(N - VISIBLE), ...items, ...items.slice(0, VISIBLE)]
    : items;

  const go = useCallback((dir: 1 | -1) => {
    setAnim(true);
    setIdx((i) => i + dir);
  }, []);

  useEffect(() => {
    if (!canScroll) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (!pausedRef.current) go(1);
    }, 3000);
    return () => clearInterval(id);
  }, [canScroll, go]);

  // 클론 구간으로 넘어가면 전환 직후 애니메이션 없이 실제 구간으로 되돌린다(끊김 없는 순환).
  useEffect(() => {
    if (!canScroll) return;
    let t: ReturnType<typeof setTimeout> | undefined;
    if (idx > VISIBLE + N - 1) {
      t = setTimeout(() => { setAnim(false); setIdx(VISIBLE); }, 500);
    } else if (idx < VISIBLE) {
      t = setTimeout(() => { setAnim(false); setIdx(VISIBLE + N - 1); }, 500);
    }
    return () => { if (t) clearTimeout(t); };
  }, [idx, N, canScroll]);

  // 무전환 스냅 후 다음 프레임에 애니메이션을 다시 켠다.
  useEffect(() => {
    if (anim) return;
    const r = requestAnimationFrame(() => setAnim(true));
    return () => cancelAnimationFrame(r);
  }, [anim]);

  if (N === 0) return null;

  return (
    <div
      className="relative rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none overflow-hidden"
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
      onFocusCapture={() => (pausedRef.current = true)}
      onBlurCapture={() => (pausedRef.current = false)}
    >
      <div className="overflow-hidden" style={{ height: VISIBLE * ROW }}>
        <div
          style={{
            transform: `translateY(-${(canScroll ? idx : 0) * ROW}px)`,
            transition: anim ? "transform 0.5s ease" : "none",
          }}
        >
          {list.map((it, i) => (
            <Link
              key={`${it.word}-${i}`}
              href={`/keyword/${encodeURIComponent(it.word)}`}
              style={{ height: ROW }}
              className="flex items-center px-4 sm:px-5 pr-10 text-sm sm:text-base font-semibold tracking-tight border-b border-zinc-100 dark:border-zinc-800/60 last:border-b-0 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <span className="truncate">{it.text}</span>
            </Link>
          ))}
        </div>
      </div>

      {canScroll && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
          <button
            type="button"
            aria-label="이전 급상승 키워드"
            onClick={() => go(-1)}
            className="w-6 h-6 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs"
          >
            ▴
          </button>
          <button
            type="button"
            aria-label="다음 급상승 키워드"
            onClick={() => go(1)}
            className="w-6 h-6 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-xs"
          >
            ▾
          </button>
        </div>
      )}
    </div>
  );
}
