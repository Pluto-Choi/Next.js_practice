import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import KeywordDisplay from "../components/KeywordDisplay";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import { jsonLdHtml } from "../jsonld";
import { loadHistoryData, getRecentDates, getRankChanges, getAllDates } from "../data";

type Props = { params: Promise<{ date: string }> };

export async function generateStaticParams() {
  return (await getAllDates()).map((date) => ({ date }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const data = await loadHistoryData(date);
  if (!data) return { title: "오늘의 뉴스" };
  const issue = data.categories["오늘의 이슈"];
  const issueKeywords = issue?.keywords.slice(0, 3).map((k) => k.word) ?? [];
  const keywordStr = issueKeywords.join(" · ");
  const title = keywordStr ? `${date} 뉴스 | ${keywordStr}` : `${date} 뉴스 | 오늘의 뉴스`;
  const description = issue?.summary
    ? `${date} 핫이슈 — ${issue.summary}`
    : `${date}의 핫이슈, 연예, 경제 뉴스 키워드 TOP5.`;
  const ogImage = `/opengraph-image?v=${encodeURIComponent(`${date}-${issueKeywords[0] ?? ""}`)}`;
  return {
    title,
    description,
    alternates: { canonical: `/${date}` },
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function HistoryPage({ params }: Props) {
  const { date } = await params;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const [data, recentDates] = await Promise.all([loadHistoryData(date), getRecentDates()]);

  if (!data) notFound();

  const rankChanges = await getRankChanges(data);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(data) }}
      />
      <main id="main-content" tabIndex={-1} className="max-w-lg lg:max-w-5xl mx-auto px-4 py-6">

        <h1 className="sr-only">{date} 뉴스 키워드 — 핫이슈 · 연예 · 경제 TOP5</h1>

        <div className="relative mb-8 text-center">
          <ThemeToggle />
          <div className="flex justify-center mb-2">
            <Logo />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{data.date} · Google News RSS</p>
        </div>

        {recentDates.length > 0 && (
          <div className="relative mb-6">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="navigation" aria-label="날짜 선택">
              <Link
                href="/"
                className="px-3 py-2.5 rounded-full text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors shrink-0"
              >
                오늘
              </Link>
              {recentDates.slice(1).map((d) => (
                <Link
                  key={d}
                  href={`/${d}`}
                  className={`px-3 py-2.5 rounded-full text-xs font-medium shrink-0 transition-colors ${
                    d === date
                      ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold"
                      : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500"
                  }`}
                >
                  {d.slice(5)}
                </Link>
              ))}
            </div>
            <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-zinc-50 dark:from-zinc-950" aria-hidden="true" />
          </div>
        )}

        <KeywordDisplay data={data} rankChanges={rankChanges} />

        <p className="text-center text-zinc-500 dark:text-zinc-400 text-xs pb-4">
          6시간마다 자동 업데이트 · Google News RSS 기반
        </p>
      </main>
    </div>
  );
}
