"use client";

import { useRef, useState } from "react";
import type { Streak } from "../data";
import { categoryEmoji, categoryLabel } from "../categories";

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
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // 탭 위젯은 화살표 키로 이동(←/→·Home/End)하는 것이 ARIA 표준이다.
  // 좌우 이동 즉시 해당 기간을 선택(자동 활성화)하고 포커스도 옮긴다.
  const onTabKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let next = idx;
    if (e.key === "ArrowRight") next = (idx + 1) % PERIODS.length;
    else if (e.key === "ArrowLeft") next = (idx - 1 + PERIODS.length) % PERIODS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = PERIODS.length - 1;
    else return;
    e.preventDefault();
    setPeriod(PERIODS[next].key);
    tabRefs.current[next]?.focus();
  };

  return (
    <section className="mb-10">
      <div className="flex items-baseline gap-2 mb-3.5">
        <h2 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          최장 1위 연속 기록
        </h2>
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="flex gap-1.5 mb-4" role="tablist" aria-label="기간 선택">
        {PERIODS.map((p, i) => {
          const selected = period === p.key;
          return (
            <button
              key={p.key}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              id={`streak-tab-${p.key}`}
              aria-selected={selected}
              aria-controls="streak-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setPeriod(p.key)}
              onKeyDown={(e) => onTabKeyDown(e, i)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                selected
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                  : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500"
              }`}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      <div id="streak-panel" role="tabpanel" aria-labelledby={`streak-tab-${period}`} tabIndex={0} className="outline-none">
      {list.length === 0 ? (
        <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm py-10">
          이 기간엔 2일 이상 연속 1위 기록이 없어요.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {list.map((s) => (
            <div
              key={`${s.word}-${s.category}-${s.start}`}
              className="px-4 py-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold tracking-tight truncate flex-1 min-w-0">{s.word}</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                  {categoryEmoji[s.category] ?? "📌"} {categoryLabel[s.category] ?? s.category}
                </span>
                <span className="text-xs font-bold text-orange-700 dark:text-orange-400 tabular-nums shrink-0">
                  {s.streak}일 연속
                </span>
              </div>
              <div className="mt-1 text-xs text-zinc-400 dark:text-zinc-500 tabular-nums">
                {md(s.start)} ~ {md(s.end)}
              </div>
              {s.ai_summary && (
                <p className="mt-2.5 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300 border-l-2 border-orange-300 dark:border-orange-800 pl-3 break-keep">
                  {s.ai_summary}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
    </section>
  );
}
