import Link from "next/link";
import type { Metadata } from "next";
import KeywordDisplay from "./components/KeywordDisplay";
import Logo from "./components/Logo";
import InstallButton from "./components/InstallButton";
import NotificationButton from "./components/NotificationButton";
import ThemeToggle from "./components/ThemeToggle";
import { buildJsonLd } from "./jsonld";
import { CATEGORIES } from "./categories";
import { loadCurrentData, getRecentDates, getRankChanges } from "./data";

export async function generateMetadata(): Promise<Metadata> {
  const data = await loadCurrentData();
  const issue = data.categories["오늘의 이슈"];
  const issueKeywords = issue?.keywords.slice(0, 3).map((k) => k.word) ?? [];
  const keywordStr = issueKeywords.join(" · ");
  const title = keywordStr ? `오늘의 뉴스 | ${keywordStr}` : "오늘의 뉴스 | 핫이슈 & 경제 키워드";
  const description = issue?.summary
    ? `${data.date} 오늘의 핫이슈 — ${issue.summary}`
    : "오늘 가장 핫한 이슈, 연예, 경제 뉴스 키워드를 한눈에. 6시간마다 자동 업데이트.";
  // 키워드는 매일 바뀌지만 og:image 경로는 고정이라 메신저가 옛 이미지를 캐시함.
  // 날짜+1위 키워드로 버전을 붙여 미리보기 캐시를 매일 갱신시킨다.
  const ogImage = `/opengraph-image?v=${encodeURIComponent(`${data.date}-${issueKeywords[0] ?? ""}`)}`;
  return {
    title,
    description,
    alternates: { canonical: "/" },
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

export default async function Home() {
  const [data, recentDates] = await Promise.all([loadCurrentData(), getRecentDates()]);
  const rankChanges = await getRankChanges(data);
  const jsonLd = buildJsonLd(data);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-lg mx-auto px-4 py-6">

        <h1 className="sr-only">오늘의 뉴스 — {data.date} 핫이슈 · 연예 · 경제 키워드 TOP5</h1>

        <div className="relative mb-8 text-center">
          <ThemeToggle />
          <div className="flex justify-center mb-2">
            <Logo />
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {data.updated_at ? `${data.updated_at} 업데이트` : data.date} · Google News RSS
          </p>
        </div>

        <InstallButton />

        <NotificationButton />

        {recentDates.length > 1 && (
          <div className="relative mb-6">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="navigation" aria-label="날짜 선택">
              <span className="px-3 py-2.5 rounded-full text-xs font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shrink-0">
                오늘
              </span>
              {recentDates.slice(1).map((date) => (
                <Link
                  key={date}
                  href={`/${date}`}
                  className="px-3 py-2.5 rounded-full text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors shrink-0"
                >
                  {date.slice(5)}
                </Link>
              ))}
            </div>
            <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-zinc-50 dark:from-zinc-950" aria-hidden="true" />
          </div>
        )}

        <div className="flex gap-2 mb-6 justify-center flex-wrap" role="navigation" aria-label="카테고리별 보기">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="px-3 py-2.5 rounded-full text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
            >
              {c.emoji} {c.name}
            </Link>
          ))}
        </div>

        <KeywordDisplay data={data} rankChanges={rankChanges} />

        <p className="text-center text-zinc-400 text-xs pb-4">
          6시간마다 자동 업데이트 · Google News RSS 기반
        </p>
      </div>
    </div>
  );
}
