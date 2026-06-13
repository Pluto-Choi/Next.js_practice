import type { Metadata } from "next";
import AppShell from "../components/AppShell";
import StreakTrends from "../components/StreakTrends";
import DateArchive from "../components/DateArchive";
import { loadTrends, getDateArchive } from "../data";

export const metadata: Metadata = {
  title: "키워드 트렌드 | 왓뉴스",
  description: "뉴스 키워드가 가장 오래 1위를 지킨 기록을 기간별로. 왜 화제였는지 AI 요약까지.",
  alternates: { canonical: "/trends" },
};

export default async function TrendsPage() {
  const [trends, archive] = await Promise.all([loadTrends(), getDateArchive()]);
  const hasStreaks =
    trends?.streaks && Object.values(trends.streaks).some((l) => l.length > 0);

  return (
    <AppShell>
      <div className="max-w-2xl">
        <p className="mb-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          📊 키워드 트렌드{trends ? ` · 최근 ${trends.days}일` : ""}
        </p>

        {archive.length > 0 && (
          <div className="mb-10">
            <DateArchive entries={archive} />
          </div>
        )}

        {hasStreaks && <StreakTrends streaks={trends!.streaks} />}

        {!hasStreaks && archive.length === 0 && (
          <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm py-16">
            아직 집계할 데이터가 부족해요. 곧 채워질 거예요.
          </p>
        )}

        <div className="mt-8 mb-4 flex justify-center">
          <a
            href="/keyword-history.csv"
            download
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
          >
            📥 전체 키워드 순위 데이터 내려받기 (CSV)
          </a>
        </div>

        <p className="text-center text-zinc-500 dark:text-zinc-400 text-xs pb-4">
          누적 수집 데이터 기반 · Google News RSS
        </p>
      </div>
    </AppShell>
  );
}
