"use client";

import { useState } from "react";
import type { Streak } from "../data";
import { categoryEmoji } from "../categories";

const PERIODS: { key: string; label: string }[] = [
  { key: "30", label: "1개월" },
  { key: "90", label: "3개월" },
  { key: "180", label: "6개월" },
  { key: "365", label: "1년" },
];

// 2026-05-22 → 05.22
function md(date: string) {
  return date.slice(5).replace("-", ".");
}

export default function StreakTrends({
  streaks,
}: {
  streaks: { [period: string]: Streak[] };
}) {
  const [period, setPeriod] = useState("365");
  const list = streaks[period] ?? [];

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">👑</span>
        <h2 className="text-sm font-bold tracking-wide text-zinc-600 dark:text-zinc-300">
          최장 1위 연속 기록
        </h2>
        <div className="flex-1 h-px bg-zinc-300 dark:bg-zinc-700 opacity-40" />
      </div>

      <div className="flex gap-1.5 mb-4" role="tablist" aria-label="기간 선택">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            role="tab"
            aria-selected={period === p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              period === p.key
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm py-10">
          이 기간엔 2일 이상 연속 1위 기록이 없어요.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((s) => (
            <div
              key={`${s.word}-${s.category}-${s.start}`}
              className="px-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold truncate flex-1 min-w-0">{s.word}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                  {categoryEmoji[s.category] ?? "📌"} {s.category}
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums shrink-0">
                  {s.streak}일 연속
                </span>
              </div>
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                {md(s.start)} ~ {md(s.end)}
              </div>
              {s.ai_summary && (
                <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 border-l-2 border-amber-400/60 dark:border-amber-500/50 pl-2.5">
                  {s.ai_summary}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
