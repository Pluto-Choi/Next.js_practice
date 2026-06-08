import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Logo from "../../components/Logo";
import ThemeToggle from "../../components/ThemeToggle";
import { getAllKeywords, getKeywordDetail } from "../../data";
import { categoryEmoji } from "../../categories";
import { rankBadgeStyle, cleanTitle } from "../../lib/format";

type Props = { params: Promise<{ term: string }> };

export async function generateStaticParams() {
  return (await getAllKeywords()).map((term) => ({ term }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { term } = await params;
  const detail = await getKeywordDetail(term);
  if (!detail) return { title: "오늘의 뉴스" };
  const { word, daysCount, peakRank } = detail;
  const title = `${word} 실시간 검색어 추이 | 오늘의 뉴스`;
  const description = `'${word}' 키워드는 최근 화제 키워드에 ${daysCount}회 올랐고 최고 ${peakRank}위를 기록했어요. 관련 뉴스와 순위 추이를 한눈에.`;
  return {
    title,
    description,
    alternates: { canonical: `/keyword/${encodeURIComponent(word)}` },
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function KeywordPage({ params }: Props) {
  const { term } = await params;
  const detail = await getKeywordDetail(term);
  if (!detail) notFound();

  const { word, entries, daysCount, peakRank, categories, articles, description } = detail;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="relative mb-8 text-center">
          <ThemeToggle />
          <div className="flex justify-center mb-2">
            <Logo />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">📈 키워드 추이 · Google News RSS</p>
        </div>

        <div className="flex gap-2 mb-6 justify-center flex-wrap" role="navigation" aria-label="이동">
          <Link
            href="/"
            className="px-3 py-2.5 rounded-full text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
          >
            ← 오늘의 뉴스
          </Link>
          <Link
            href="/trends"
            className="px-3 py-2.5 rounded-full text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
          >
            📊 트렌드
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-center leading-tight mb-3">{word}</h1>

        <div className="flex gap-2 justify-center flex-wrap mb-6">
          {categories.map((c) => (
            <span
              key={c}
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300"
            >
              {categoryEmoji[c] || "📌"} {c}
            </span>
          ))}
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300">
            등장 {daysCount}일
          </span>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-800/60 text-yellow-700 dark:text-yellow-300">
            최고 {peakRank}위
          </span>
        </div>

        {description && (
          <div className="mb-6 flex overflow-hidden rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <div className="w-1 shrink-0 bg-rose-400 dark:bg-rose-700" />
            <p className="text-zinc-900 dark:text-zinc-50 text-[15px] font-medium leading-relaxed px-3.5 py-3">
              {description}
            </p>
          </div>
        )}

        <section className="mb-8">
          <h2 className="text-sm font-bold tracking-wide text-zinc-700 dark:text-zinc-300 mb-3">순위 추이</h2>
          <div className="flex flex-col gap-2">
            {entries.map((e) => (
              <Link
                key={`${e.date}-${e.category}`}
                href={`/${e.date}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm px-4 py-3 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${rankBadgeStyle(e.rank)}`}>
                    {e.rank}위
                  </span>
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 tabular-nums">{e.date}</span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
                  {categoryEmoji[e.category] || "📌"} {e.category}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {articles.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold tracking-wide text-zinc-700 dark:text-zinc-300 mb-3">관련 뉴스</h2>
            <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm px-4 py-3 flex flex-col gap-3">
              {articles.map((article, idx) => (
                <a
                  key={article.link}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 group/link -mx-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40 active:bg-zinc-100 dark:active:bg-zinc-700/40"
                >
                  <span className="text-zinc-300 dark:text-zinc-600 text-xs font-medium mt-0.5 shrink-0 w-3">{idx + 1}</span>
                  <div className="min-w-0">
                    <p className="text-zinc-500 dark:text-zinc-400 text-[13px] leading-snug group-hover/link:text-zinc-900 dark:group-hover/link:text-white transition-colors">
                      {cleanTitle(article.title)}
                    </p>
                    {article.source && (
                      <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">{article.source}</p>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        <p className="text-center text-zinc-500 dark:text-zinc-400 text-xs pb-4">
          누적 수집 데이터 기반 · Google News RSS
        </p>
      </main>
    </div>
  );
}
