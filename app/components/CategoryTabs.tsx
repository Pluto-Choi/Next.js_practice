"use client";

import Link from "next/link";
import { useState } from "react";
import type { CategoryData } from "./KeywordDisplay";
import { categoryEmoji, categoryLabel } from "../categories";
import { rankBadgeStyle } from "../lib/format";

export type TabCategory = {
  category: string;
  data: CategoryData;
};

// 급상승 티커 바로 아래에 놓는 카테고리 탭.
// 경제/연예/스포츠 중 하나를 골라 한 번에 한 카테고리만 카드로 보여준다.
// 카드는 위에 키워드 문구, 아래에 AI 요약을 담은 버튼형 타일이며,
// 클릭하면 해당 키워드 추이 페이지(/keyword/[word])로 이동한다.
export default function CategoryTabs({ categories }: { categories: TabCategory[] }) {
  const [active, setActive] = useState(0);
  if (categories.length === 0) return null;

  const current = categories[Math.min(active, categories.length - 1)];

  return (
    <section aria-label="카테고리별 키워드" className="mt-2">
      <div role="tablist" aria-label="카테고리 선택" className="flex gap-2 mb-5">
        {categories.map((c, i) => {
          const selected = i === active;
          return (
            <button
              key={c.category}
              role="tab"
              type="button"
              aria-selected={selected}
              onClick={() => setActive(i)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold tracking-tight transition-colors ${
                selected
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
              }`}
            >
              <span aria-hidden="true">{categoryEmoji[c.category] || "📌"}</span>
              {categoryLabel[c.category] || c.category}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {current.data.keywords.map((item) => (
          <Link
            key={item.word}
            href={`/keyword/${encodeURIComponent(item.word)}`}
            className="group flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow dark:shadow-none overflow-hidden"
          >
            <div className="flex items-center gap-2.5 px-4 pt-4">
              <span className={`text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-md shrink-0 tabular-nums ${rankBadgeStyle(item.rank)}`}>
                {item.rank}
              </span>
              <p className="text-base font-semibold leading-snug break-keep tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-orange-700 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                {item.headline || item.word}
              </p>
            </div>
            {item.description && (
              <p className="px-4 pb-4 pt-2 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400 break-keep line-clamp-3">
                {item.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
