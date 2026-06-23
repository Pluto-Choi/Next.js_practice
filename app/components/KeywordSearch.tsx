"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// 오늘 화제 키워드를 클라이언트에서 즉시 필터 → /keyword/[term] 추이 페이지로 점프.
export default function KeywordSearch({ keywords }: { keywords: string[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  // 키보드(↑/↓)로 강조 중인 결과 인덱스. -1이면 미선택.
  const [active, setActive] = useState(-1);
  const q = query.trim().toLowerCase();
  const wrapRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    if (!q) return [];
    return keywords.filter((w) => w.toLowerCase().includes(q)).slice(0, 8);
  }, [q, keywords]);

  // 입력이 바뀌면 강조 선택을 초기화한다.
  useEffect(() => {
    setActive(-1);
  }, [q]);

  // 모바일은 hover가 없어 드롭다운이 한 번 열리면 결과 외 영역을 탭해도 닫히지
  // 않고 본문을 가린다. 바깥 탭/Esc로 닫아 준다.
  useEffect(() => {
    if (!q) return;
    const onPointerDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setQuery("");
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [q]);

  // 키보드만으로 자동완성 결과를 탐색·이동할 수 있게 한다(↑/↓ 강조, Enter 이동,
  // Esc 닫기). 강조가 없으면 Enter는 첫 결과로 점프한다.
  const goTo = (word: string) => {
    setQuery("");
    router.push(`/keyword/${encodeURIComponent(word)}`);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setQuery("");
      return;
    }
    if (matches.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? matches.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      goTo(matches[active >= 0 ? active : 0]);
    }
  };

  const listboxId = "kw-search-list";

  return (
    <div ref={wrapRef} className="relative mb-5">
      <label htmlFor="kw-search" className="sr-only">
        키워드 검색
      </label>
      <input
        id="kw-search"
        type="search"
        role="combobox"
        aria-expanded={!!q}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `kw-opt-${active}` : undefined}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="키워드 검색 (예: 환율, 손흥민)"
        autoComplete="off"
        className="w-full rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-orange-400 dark:focus:border-orange-600 transition-colors"
      />
      {q && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-2 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden"
        >
          {matches.length > 0 ? (
            matches.map((w, i) => (
              <Link
                key={w}
                id={`kw-opt-${i}`}
                role="option"
                aria-selected={i === active}
                href={`/keyword/${encodeURIComponent(w)}`}
                onClick={() => setQuery("")}
                onMouseEnter={() => setActive(i)}
                className={`block px-4 py-2.5 text-sm transition-colors ${
                  i === active
                    ? "bg-zinc-50 dark:bg-zinc-800/60 text-orange-700 dark:text-orange-400"
                    : "text-zinc-700 dark:text-zinc-200"
                }`}
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
