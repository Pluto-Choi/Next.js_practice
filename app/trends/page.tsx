import Link from "next/link";
import type { Metadata } from "next";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import StreakTrends from "../components/StreakTrends";
import { loadTrends } from "../data";

export const metadata: Metadata = {
  title: "키워드 트렌드 | 오늘의 뉴스",
  description: "뉴스 키워드가 가장 오래 1위를 지킨 기록을 기간별로. 왜 화제였는지 AI 요약까지.",
  alternates: { canonical: "/trends" },
};

export default async function TrendsPage() {
  const trends = await loadTrends();
  const hasStreaks =
    trends?.streaks && Object.values(trends.streaks).some((l) => l.length > 0);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="relative mb-8 text-center">
          <ThemeToggle />
          <div className="flex justify-center mb-2">
            <Logo />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
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

        {!hasStreaks ? (
          <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm py-16">
            아직 집계할 데이터가 부족해요. 곧 채워질 거예요.
          </p>
        ) : (
          <StreakTrends streaks={trends!.streaks} />
        )}

        <p className="text-center text-zinc-500 dark:text-zinc-400 text-xs pb-4">
          누적 수집 데이터 기반 · Google News RSS
        </p>
      </main>
    </div>
  );
}
