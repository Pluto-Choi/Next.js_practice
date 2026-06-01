import Link from "next/link";
import type { Metadata } from "next";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import Sparkline from "../components/Sparkline";
import { loadTrends, type TrendEntry } from "../data";

export const metadata: Metadata = {
  title: "키워드 트렌드 | 오늘의 뉴스",
  description: "최근 수집된 뉴스 키워드의 누적 등장 횟수와 1위 연속 기록을 한눈에.",
  alternates: { canonical: "/trends" },
};

const categoryEmoji: { [k: string]: string } = {
  "오늘의 이슈": "🔥",
  연예: "🎤",
  경제: "💰",
};

function dayDiff(a: string, b: string) {
  return (Date.parse(b) - Date.parse(a)) / 86_400_000;
}

// 날짜별 최선(최소) 순위로 압축한 시계열
function bestRankSeries(entries: TrendEntry[]) {
  const byDate = new Map<string, number>();
  for (const e of entries) {
    const cur = byDate.get(e.date);
    if (cur === undefined || e.rank < cur) byDate.set(e.date, e.rank);
  }
  return [...byDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, r]) => r);
}

export default async function TrendsPage() {
  const trends = await loadTrends();

  const words = Object.entries(trends?.keywords ?? {});

  // 누적 최다 등장 (서로 다른 날짜 수 기준)
  const topByAppearance = words
    .map(([word, entries]) => {
      const dates = new Set(entries.map((e) => e.date));
      return { word, days: dates.size, series: bestRankSeries(entries) };
    })
    .sort((a, b) => b.days - a.days || a.word.localeCompare(b.word))
    .slice(0, 12);

  // 카테고리별 1위 최장 연속 기록
  const streaks: { word: string; category: string; streak: number }[] = [];
  for (const [word, entries] of words) {
    const byCat = new Map<string, string[]>();
    for (const e of entries) {
      if (e.rank === 1) {
        const arr = byCat.get(e.category) ?? [];
        arr.push(e.date);
        byCat.set(e.category, arr);
      }
    }
    for (const [category, ds] of byCat) {
      ds.sort();
      let best = 1;
      let cur = 1;
      for (let i = 1; i < ds.length; i++) {
        if (dayDiff(ds[i - 1], ds[i]) === 1) {
          cur++;
          best = Math.max(best, cur);
        } else {
          cur = 1;
        }
      }
      if (best >= 2) streaks.push({ word, category, streak: best });
    }
  }
  streaks.sort((a, b) => b.streak - a.streak || a.word.localeCompare(b.word));
  const topStreaks = streaks.slice(0, 8);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="relative mb-8 text-center">
          <ThemeToggle />
          <div className="flex justify-center mb-2">
            <Logo />
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            📊 키워드 트렌드{trends ? ` · 최근 ${trends.days}일` : ""}
          </p>
        </div>

        <div className="flex gap-2 mb-6 justify-center flex-wrap" role="navigation" aria-label="이동">
          <Link
            href="/"
            className="px-3 py-2.5 rounded-full text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
          >
            ← 오늘의 뉴스
          </Link>
        </div>

        {!trends || topByAppearance.length === 0 ? (
          <p className="text-center text-zinc-400 dark:text-zinc-500 text-sm py-16">
            아직 집계할 데이터가 부족해요. 곧 채워질 거예요.
          </p>
        ) : (
          <>
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">📈</span>
                <h2 className="text-sm font-bold tracking-wide text-zinc-600 dark:text-zinc-300">
                  가장 꾸준한 키워드
                </h2>
                <div className="flex-1 h-px bg-zinc-300 dark:bg-zinc-700 opacity-40" />
              </div>
              <div className="flex flex-col gap-2">
                {topByAppearance.map((item, i) => (
                  <div
                    key={item.word}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm"
                  >
                    <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 w-5 shrink-0 tabular-nums">
                      {i + 1}
                    </span>
                    <span className="text-sm font-bold truncate flex-1 min-w-0">{item.word}</span>
                    <Sparkline ranks={item.series} />
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 tabular-nums w-10 text-right shrink-0">
                      {item.days}일
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {topStreaks.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">👑</span>
                  <h2 className="text-sm font-bold tracking-wide text-zinc-600 dark:text-zinc-300">
                    최장 1위 연속 기록
                  </h2>
                  <div className="flex-1 h-px bg-zinc-300 dark:bg-zinc-700 opacity-40" />
                </div>
                <div className="flex flex-col gap-2">
                  {topStreaks.map((s) => (
                    <div
                      key={`${s.word}-${s.category}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm"
                    >
                      <span className="text-sm font-bold truncate flex-1 min-w-0">{s.word}</span>
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0">
                        {categoryEmoji[s.category] ?? "📌"} {s.category}
                      </span>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums shrink-0">
                        {s.streak}일 연속
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <p className="text-center text-zinc-400 text-xs pb-4">
          누적 수집 데이터 기반 · Google News RSS
        </p>
      </div>
    </div>
  );
}
