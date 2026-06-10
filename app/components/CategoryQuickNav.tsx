"use client";

import { useEffect, useState } from "react";

export type QuickTarget = { slug: string; emoji: string; label: string };

// 모바일 긴 스크롤에서 섹션으로 바로 점프 + 현재 보고 있는 섹션을 강조(스크롤스파이).
export default function CategoryQuickNav({ targets }: { targets: QuickTarget[] }) {
  const [active, setActive] = useState(targets[0]?.slug ?? "");

  useEffect(() => {
    const sections = targets
      .map((t) => document.getElementById(`sec-${t.slug}`))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id.replace(/^sec-/, ""));
      },
      // 스티키 바(상단 ~56px) 바로 아래에 들어온 섹션을 현재로 본다.
      { rootMargin: "-56px 0px -65% 0px", threshold: 0 }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [targets]);

  return (
    <nav
      aria-label="카테고리 바로가기"
      className="md:hidden sticky top-0 z-20 -mx-4 mb-4 border-b border-zinc-200/70 bg-zinc-50/90 px-4 py-2 backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/90"
    >
      <div className="flex gap-2 overflow-x-auto scrollbar-none">
        {targets.map(({ slug, emoji, label }) => {
          const isActive = slug === active;
          return (
            <a
              key={slug}
              href={`#sec-${slug}`}
              aria-current={isActive ? "true" : undefined}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive
                  ? "border-blue-500 bg-blue-50 text-blue-600 dark:border-blue-500 dark:bg-blue-950/50 dark:text-blue-400"
                  : "border-zinc-200 bg-white text-zinc-600 hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-blue-600 dark:hover:text-blue-400"
              }`}
            >
              {emoji} {label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
