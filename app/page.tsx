import Link from "next/link";
import type { Metadata } from "next";
import KeywordDisplay from "./components/KeywordDisplay";
import SiteHeader from "./components/SiteHeader";
import InstallButton from "./components/InstallButton";
import NotificationButton from "./components/NotificationButton";
import UpdatedAt from "./components/UpdatedAt";
import KeywordSearch from "./components/KeywordSearch";
import LeftSidebar from "./components/LeftSidebar";
import RightSidebar from "./components/RightSidebar";
import { jsonLdHtml } from "./jsonld";
import { loadCurrentData, getRecentDates, getRankChanges } from "./data";

export async function generateMetadata(): Promise<Metadata> {
  const data = await loadCurrentData();
  const issue = data.categories["오늘의 이슈"];
  const issueKeywords = issue?.keywords.slice(0, 3).map((k) => k.word) ?? [];
  const keywordStr = issueKeywords.join(" · ");
  const title = keywordStr ? `왓뉴스 | ${keywordStr}` : "왓뉴스 | 핫이슈 & 경제 키워드";
  const description = issue?.summary
    ? `${data.date} 오늘의 핫이슈 — ${issue.summary}`
    : "오늘 가장 핫한 이슈, 연예, 경제 뉴스 키워드를 한눈에. 매일 아침·저녁 자동 업데이트.";
  // 키워드는 매일 바뀌지만 og:image 경로는 고정이라 메신저가 옛 이미지를 캐시함.
  // 날짜+1위 키워드로 버전을 붙여 미리보기 캐시를 매일 갱신시킨다.
  const ogImage = `/opengraph-image?v=${encodeURIComponent(`${data.date}-${issueKeywords[0] ?? ""}`)}`;
  return {
    title,
    description,
    alternates: {
      canonical: "/",
      types: {
        "application/rss+xml": [{ url: "/rss.xml", title: "왓뉴스" }],
      },
    },
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

  const searchKeywords = Array.from(
    new Set(
      Object.values(data.categories).flatMap((c) => c.keywords.map((k) => k.word))
    )
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(data) }}
      />
      <SiteHeader widthClass="max-w-lg lg:max-w-7xl" />

      <div className="mx-auto max-w-lg lg:max-w-7xl px-4 py-3 lg:py-6 lg:grid lg:grid-cols-[25px_150px_24px_minmax(0,1fr)_24px_210px_35px] lg:gap-0 lg:items-start">
        <LeftSidebar recentDates={recentDates} className="hidden lg:block lg:col-start-2 lg:sticky lg:top-6" />

        <main id="main-content" tabIndex={-1} className="min-w-0 lg:col-start-4">

        <h1 className="sr-only">왓뉴스 — {data.date} 핫이슈 · 연예 · 경제 키워드 TOP5</h1>

        <p className="mb-3 lg:mb-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          <UpdatedAt updatedAt={data.updated_at} date={data.date} /> · Google News RSS
        </p>

        {recentDates.length > 1 && (
          <div className="relative mb-3 lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="navigation" aria-label="날짜 선택">
              <span aria-current="page" className="px-3 py-2.5 rounded-full text-xs font-semibold bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shrink-0">
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

        <KeywordDisplay data={data} rankChanges={rankChanges} />

        {/* 검색은 "원하는 걸 아는" 2차 행동. 글랜스(랭킹 보드)를 위로 올리고
            검색창은 보드 아래로 내린다. 하단 탭바의 /#search 앵커가 여기로 스크롤한다. */}
        <div id="search" className="scroll-mt-20 mt-8">
          <KeywordSearch keywords={searchKeywords} />
        </div>

        <div className="mt-8">
          <InstallButton />
          <NotificationButton />
        </div>

        <p className="text-center text-zinc-500 dark:text-zinc-400 text-xs pb-4">
          매일 아침·저녁 자동 업데이트 · Google News RSS 기반
        </p>
        </main>

        <RightSidebar className="hidden lg:block lg:col-start-6 lg:sticky lg:top-6" />
      </div>
    </div>
  );
}
