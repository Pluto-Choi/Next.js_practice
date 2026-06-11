import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteHeader from "../../components/SiteHeader";
import { getAllKeywords, getKeywordDetail } from "../../data";
import { categoryEmoji, categoryLabel } from "../../categories";
import { cleanTitle } from "../../lib/format";

type Props = { params: Promise<{ term: string }> };

export async function generateStaticParams() {
  return (await getAllKeywords()).map((term) => ({ term }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { term } = await params;
  const detail = await getKeywordDetail(term);
  if (!detail) return { title: "왓뉴스" };
  const { word, headline, daysCount, peakRank } = detail;
  const title = `${headline || word} | 왓뉴스`;
  const description =
    detail.description ||
    `'${word}' 키워드는 최근 화제 키워드에 ${daysCount}회 올랐고 최고 ${peakRank}위를 기록했어요. 관련 뉴스와 순위 추이를 한눈에.`;
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

  const { word, headline, categories, latestDate, articles, description } = detail;
  const title = headline || word;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <SiteHeader widthClass="max-w-2xl" />
      <main id="main-content" tabIndex={-1} className="max-w-2xl mx-auto px-5 py-8 lg:py-10">
        {/* 데스크탑 네비 (모바일은 하단 탭바가 담당) */}
        <div className="hidden lg:flex gap-2 mb-8" role="navigation" aria-label="이동">
          <Link
            href="/"
            className="px-3 py-2 rounded-full text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
          >
            ← 왓뉴스
          </Link>
          <Link
            href="/trends"
            className="px-3 py-2 rounded-full text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
          >
            📊 트렌드
          </Link>
        </div>

        {/* === 문서 헤더 (노션 타이틀 블록) === */}
        <header className="mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3 text-xs text-zinc-500 dark:text-zinc-400">
            {categories.map((c) => (
              <span key={c} className="font-medium">
                {categoryEmoji[c] || "📌"} {categoryLabel[c] || c}
              </span>
            ))}
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{latestDate}</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold leading-snug tracking-tight break-keep">
            {title}
          </h1>
        </header>

        {/* === 본문 도입 (AI 요약) === */}
        {description && (
          <section className="mb-12">
            <p className="text-base lg:text-[17px] leading-relaxed text-zinc-700 dark:text-zinc-200 break-keep">
              {description}
            </p>
          </section>
        )}

        {/* === 관련 뉴스 === */}
        {articles.length > 0 && (
          <section className="mb-12">
            <h2 className="text-base font-bold tracking-tight mb-4 flex items-center gap-2">
              <span aria-hidden="true">📰</span>관련 뉴스
            </h2>
            <div className="flex flex-col">
              {articles.map((article) => (
                <a
                  key={article.link}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link block py-3.5 border-b border-zinc-100 dark:border-zinc-800/60 first:pt-0 transition-colors"
                >
                  <p className="text-[15px] leading-snug text-zinc-800 dark:text-zinc-100 group-hover/link:text-orange-700 dark:group-hover/link:text-orange-400 transition-colors break-keep">
                    {cleanTitle(article.title)}
                  </p>
                  {article.source && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{article.source}</p>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        <p className="text-zinc-400 dark:text-zinc-500 text-xs pb-4">
          누적 수집 데이터 기반 · Google News RSS
        </p>
      </main>
    </div>
  );
}
