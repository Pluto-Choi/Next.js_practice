import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import KeywordDisplay, { type KeywordsData } from "../components/KeywordDisplay";
import Logo from "../components/Logo";

async function loadHistoryData(date: string): Promise<KeywordsData | null> {
  try {
    const filePath = path.join(process.cwd(), "data", "history", `${date}.json`);
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function getRecentDates(): Promise<string[]> {
  try {
    const historyDir = path.join(process.cwd(), "data", "history");
    const files = await fs.readdir(historyDir);
    return files
      .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .map((f) => f.replace(".json", ""))
      .sort()
      .reverse()
      .slice(0, 7);
  } catch {
    return [];
  }
}

type Props = { params: Promise<{ date: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const data = await loadHistoryData(date);
  if (!data) return { title: "오늘의 뉴스" };
  const issueKeywords = data.categories["오늘의 이슈"]?.keywords.slice(0, 3).map((k) => k.word) ?? [];
  const keywordStr = issueKeywords.join(" · ");
  return {
    title: keywordStr ? `${date} 뉴스 | ${keywordStr}` : `${date} 뉴스 | 오늘의 뉴스`,
    openGraph: {
      title: keywordStr ? `${date} 뉴스 | ${keywordStr}` : `${date} 뉴스 | 오늘의 뉴스`,
    },
  };
}

export default async function HistoryPage({ params }: Props) {
  const { date } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const [data, recentDates] = await Promise.all([loadHistoryData(date), getRecentDates()]);

  if (!data) notFound();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <div className="max-w-lg mx-auto px-4 py-6">

        <div className="mb-8 text-center">
          <div className="flex justify-center mb-2">
            <Logo />
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{data.date} · Google News RSS</p>
        </div>

        {recentDates.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-none">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors shrink-0"
            >
              오늘
            </Link>
            {recentDates.slice(1).map((d) => (
              <Link
                key={d}
                href={`/${d}`}
                className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
                  d === date
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold"
                    : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500"
                }`}
              >
                {d.slice(5)}
              </Link>
            ))}
          </div>
        )}

        <KeywordDisplay data={data} />

        <p className="text-center text-zinc-400 text-xs pb-4">
          3시간마다 자동 업데이트 · Google News RSS 기반
        </p>
      </div>
    </div>
  );
}
