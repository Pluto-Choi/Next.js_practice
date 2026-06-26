import type { Metadata } from "next";
import AppShell from "../components/AppShell";
import DateArchive from "../components/DateArchive";
import { getDateArchive } from "../data";

export const metadata: Metadata = {
  title: "뉴스창고 | 왓뉴스",
  description: "왓뉴스가 매일 모은 뉴스를 월·날짜별로 둘러보세요. 그날의 핫이슈 키워드를 한눈에.",
  alternates: { canonical: "/trends" },
};

export default async function TrendsPage() {
  const archive = await getDateArchive();

  return (
    <AppShell>
      <div>
        <header className="mb-6">
          <h1 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            <span aria-hidden="true">🗃️</span>뉴스창고
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400 break-keep">
            그동안 모은 뉴스를 한 곳에. 지난 날의 키워드를 둘러보세요.
          </p>
        </header>

        {archive.length > 0 && (
          <div className="mb-10">
            <DateArchive entries={archive} />
          </div>
        )}

        {archive.length === 0 && (
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
