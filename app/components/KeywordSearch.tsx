"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

// 오늘 화제 키워드를 클라이언트에서 즉시 필터 → /keyword/[term] 추이 페이지로 점프.
export default function KeywordSearch({ keywords }: { keywords: string[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const wrapRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    if (!q) return [];
    return keywords.filter((w) => w.toLowerCase().includes(q)).slice(0, 8);
  }, [q, keywords]);

  // 모바일은 hover가 없어 드롭다운이 한 번 열리면 결과 외 영역을 탭해도 닫히지
  // 않고 본문을 가린다. 바깥 탭/Esc로 닫아 준다.
  useEffect(() => {
    if (!q) return;
    const onPointerDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setQuery("");
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setQuery("");
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [q]);

  return (
    <div ref={wrapRef} className="relative mb-5">
      <label htmlFor="kw-search" className="sr-only">
        키워드 검색
      </label>
      <input
        id="kw-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="키워드 검색 (예: 환율, 손흥민)"
        autoComplete="off"
        className="w-full rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-orange-400 dark:focus:border-orange-600 transition-colors"
      />
      {q && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden">
          {matches.length > 0 ? (
            matches.map((w) => (
              <Link
                key={w}
                href={`/keyword/${encodeURIComponent(w)}`}
                onClick={() => setQuery("")}
                className="block px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-orange-700 dark:hover:text-orange-400 transition-colors"
              >
                {w}
              </Link>
            ))
          ) : (
            <p className="px-4 py-2.5 text-sm text-zinc-400 dark:text-zinc-500">
              검색 결과 없음
            </p>
          )}
        </div>
      )}
    </div>
  );
}
