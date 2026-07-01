"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DateArchiveEntry } from "../data";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// YYYY-MM-DD를 UTC 기준으로 파싱해 빌드 타임존과 무관하게 요일/일자를 뽑는다.
function parts(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return { year: y, month: m, day: d, weekday };
}

// 뉴스창고: 월 탭으로 고른 달의 날짜 카드만 보여준다. 정렬(오름/내림) 토글 제공.
// 없는 날짜는 자연히 스킵(존재하는 entries만 렌더).
export default function DateArchive({ entries }: { entries: DateArchiveEntry[] }) {
  const newestDate = entries[0]?.date;

  // 월별 그룹 (entries는 최신순). monthKeys: "YYYY-MM" 최신→과거.
  const { monthKeys, byMonth, multiYear } = useMemo(() => {
    const byMonth = new Map<string, DateArchiveEntry[]>();
    const monthKeys: string[] = [];
    const years = new Set<string>();
    for (const e of entries) {
      const ym = e.date.slice(0, 7);
      years.add(e.date.slice(0, 4));
      if (!byMonth.has(ym)) {
        byMonth.set(ym, []);
        monthKeys.push(ym);
      }
      byMonth.get(ym)!.push(e);
    }
    return { monthKeys, byMonth, multiYear: years.size > 1 };
  }, [entries]);

  const monthsAsc = useMemo(() => [...monthKeys].reverse(), [monthKeys]); // 탭은 과거→최신
  const [selected, setSelected] = useState(monthKeys[0]); // 기본: 최신 달
  const [desc, setDesc] = useState(true); // true = 최신순(내림차순)

  const days = useMemo(() => {
    const list = byMonth.get(selected) ?? [];
    return [...list].sort((a, b) =>
      desc ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date),
    );
  }, [byMonth, selected, desc]);

  if (!selected) return null;

  const monthLabel = (ym: string) => {
    const [y, m] = ym.split("-");
    return multiYear ? `${y.slice(2)}.${Number(m)}월` : `${Number(m)}월`;
  };
  const [selY, selM] = selected.split("-");

  return (
    <section>
      {/* 월 탭 */}
      <div className="mb-4 flex flex-wrap gap-1.5" role="tablist" aria-label="월 선택">
        {monthsAsc.map((ym) => {
          const on = ym === selected;
          return (
            <button
              key={ym}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setSelected(ym)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                on
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600"
              }`}
            >
              {monthLabel(ym)}
            </button>
          );
        })}
      </div>

      {/* 선택 월 요약 + 정렬 토글 */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
          {selY}년 {Number(selM)}월
        </p>
        <button
          type="button"
          onClick={() => setDesc((v) => !v)}
          className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
          aria-label="정렬 순서 전환"
        >
          {desc ? "최신순 ↓" : "오래된순 ↑"}
        </button>
      </div>

      {/* 날짜 카드 그리드 (풀 width, 2~3열) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {days.map((entry) => {
          const { day, weekday } = parts(entry.date);
          const isNewest = entry.date === newestDate;
          return (
            <Link
              key={entry.date}
              href={`/${entry.date}`}
              className={`group/day block rounded-xl border bg-white dark:bg-zinc-900 p-3.5 shadow-sm dark:shadow-none transition-all hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-none active:scale-[0.98] ${
                isNewest
                  ? "border-orange-300 dark:border-orange-800/70 ring-1 ring-orange-200/60 dark:ring-orange-900/40"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
              }`}
            >
              <div className="mb-2.5 flex items-baseline gap-1.5">
                <span className="text-sm font-bold tabular-nums text-zinc-800 dark:text-zinc-100">{day}일</span>
                <span className="text-xs text-zinc-500 dark:text-zinc-500">{weekday}</span>
                {isNewest && (
                  <span className="ml-auto rounded-full bg-orange-50 dark:bg-orange-950/50 px-2 py-0.5 text-[10px] font-semibold text-orange-700 dark:text-orange-400">
                    최신
                  </span>
                )}
              </div>
              {entry.topWords.length > 0 ? (
                <ol className="flex flex-col gap-2">
                  {entry.topWords.map((w, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 w-3.5 shrink-0 text-[11px] font-bold tabular-nums text-zinc-400 dark:text-zinc-500">{i + 1}</span>
                      <span className="min-w-0 flex-1 text-[13px] leading-snug text-zinc-700 dark:text-zinc-300 line-clamp-2 break-keep group-hover/day:text-orange-700 dark:group-hover/day:text-orange-400 transition-colors">{w}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-[13px] text-zinc-400 dark:text-zinc-500">키워드 보기 ›</p>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
