import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";
import type { Metadata } from "next";
import KeywordDisplay, { type KeywordsData } from "./components/KeywordDisplay";
import Logo from "./components/Logo";

async function loadData(): Promise<KeywordsData> {
  const filePath = path.join(process.cwd(), "data", "keywords.json");
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw);
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

export async function generateMetadata(): Promise<Metadata> {
  const data = await loadData();
  const issueKeywords = data.categories["오늘의 이슈"]?.keywords.slice(0, 3).map((k) => k.word) ?? [];
  const keywordStr = issueKeywords.join(" · ");
  return {
    title: keywordStr ? `오늘의 뉴스 | ${keywordStr}` : "오늘의 뉴스 | 핫이슈 & 경제 키워드",
    openGraph: {
      title: keywordStr ? `오늘의 뉴스 | ${keywordStr}` : "오늘의 뉴스 | 핫이슈 & 경제 키워드",
    },
  };
}

export default async function Home() {
  const [data, recentDates] = await Promise.all([loadData(), getRecentDates()]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <div className="max-w-lg mx-auto px-4 py-6">

        <div className="mb-8 text-center">
          <div className="flex justify-center mb-2">
            <Logo />
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{data.date} · Google News RSS</p>
        </div>

        {recentDates.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-none">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shrink-0">
              오늘
            </span>
            {recentDates.slice(1).map((date) => (
              <Link
                key={date}
                href={`/${date}`}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors shrink-0"
              >
                {date.slice(5)}
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
