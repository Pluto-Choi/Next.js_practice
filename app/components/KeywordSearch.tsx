"use client";

import { useState } from "react";

export default function KeywordSearch() {
  const [q, setQ] = useState("");
  const [empty, setEmpty] = useState(false);

  const apply = (value: string) => {
    setQ(value);
    const needle = value.trim().toLowerCase();
    let anyVisible = false;
    document.querySelectorAll<HTMLElement>("[data-cat-block]").forEach((block) => {
      let blockHas = false;
      block.querySelectorAll<HTMLElement>("[data-kw]").forEach((el) => {
        const word = (el.dataset.kw ?? "").toLowerCase();
        const match = !needle || word.includes(needle);
        el.style.display = match ? "" : "none";
        if (match) blockHas = true;
      });
      block.style.display = blockHas ? "" : "none";
      if (blockHas) anyVisible = true;
    });
    setEmpty(!!needle && !anyVisible);
  };

  const clear = () => apply("");

  return (
    <div className="mb-6">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          inputMode="search"
          value={q}
          onChange={(e) => apply(e.target.value)}
          placeholder="키워드 검색"
          aria-label="키워드 검색"
          className="w-full pl-9 pr-9 py-2.5 rounded-full text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
        />
        {q && (
          <button
            type="button"
            onClick={clear}
            aria-label="검색어 지우기"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
      {empty && (
        <p className="mt-3 text-center text-xs text-zinc-400 dark:text-zinc-500">
          ‘{q}’에 해당하는 키워드가 없어요.
        </p>
      )}
    </div>
  );
}
