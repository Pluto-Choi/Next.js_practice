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
  const inputRef = useRef<HTMLInputElement>(null);

  // 하단 탭바의 '검색'은 /#search 앵커로 이 영역에 스크롤시킨다. 사용자의 의도는
  // 곧장 검색이므로, 해시로 도착하면 입력창에 포커스를 줘 한 번 더 탭하지 않고
  // 바로 타이핑하게 한다. 앵커 스크롤과 싸우지 않도록 preventScroll 사용.
  useEffect(() => {
    const focusIfHash = () => {
      if (window.location.hash === "#search") {
        inputRef.current?.focus({ preventScroll: true });
      }
    };
    focusIfHash();
    window.addEventListener("hashchange", focusIfHash);
    return () => window.removeEventListener("hashchange", focusIfHash);
  }, []);

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

  // 결과에서 실제로 매칭된 부분을 살짝 강조해, 어느 글자가 걸렸는지 한눈에
  // 보이게 한다. 대소문자 무시(영문 키워드 대비)로 첫 매칭 구간만 표시한다.
  const highlight = (word: string) => {
    const idx = word.toLowerCase().indexOf(q);
    if (!q || idx === -1) return word;
    return (
      <>
        {word.slice(0, idx)}
        <mark className="bg-orange-100/80 dark:bg-orange-500/25 text-inherit rounded-[3px] px-px font-semibold">
          {word.slice(idx, idx + q.length)}
        </mark>
        {word.slice(idx + q.length)}
      </>
    );
  };

  const listboxId = "kw-search-list";

  return (
    <div ref={wrapRef} className="relative mb-5">
      <label htmlFor="kw-search" className="sr-only">
        키워드 검색
      </label>
      <input
        ref={inputRef}
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
        // text-base(16px): iOS Safari는 16px 미만 입력창에 포커스하면 화면을
        // 강제 확대(auto-zoom)한다. 모바일 퍼스트 사이트라 이를 막는다.
        className="w-full rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-base text-zinc-700 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-orange-400 dark:focus:border-orange-600 transition-colors"
      />
      {/* 콤보박스가 열려도 스크린리더는 결과 개수를 자동으로 읽지 않는다.
          WAI-ARIA combobox 관습대로 결과 수(또는 없음)를 조용히 알린다. */}
      <p className="sr-only" role="status" aria-live="polite">
        {q ? (matches.length > 0 ? `검색 결과 ${matches.length}개` : "검색 결과 없음") : ""}
      </p>
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
                {highlight(w)}
              </Link>
            ))
          ) : (
            <p className="px-4 py-2.5 text-sm text-zinc-500 dark:text-zinc-500">
              검색 결과 없음
            </p>
          )}
        </div>
      )}
    </div>
  );
}
