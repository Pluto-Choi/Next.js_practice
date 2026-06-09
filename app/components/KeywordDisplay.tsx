import Link from "next/link";
import AdFitBanner from "./AdFitBanner";
import ShareButton from "./ShareButton";
import type { RankChange, RankChanges } from "../data";
import { categoryEmoji, categoryLabel, HERO_CATEGORY } from "../categories";
import { rankBadgeStyle, cleanTitle } from "../lib/format";

export type Article = {
  title: string;
  link: string;
  source: string;
};

export type Keyword = {
  rank: number;
  word: string;
  count: number;
  articles: Article[];
  description?: string;
  headline?: string;
};

export type CategoryData = {
  summary: string;
  keywords: Keyword[];
};

export type KeywordsData = {
  date: string;
  updated_at?: string;
  categories: {
    [category: string]: CategoryData;
  };
};

function RankChangeBadge({ change }: { change?: RankChange }) {
  if (!change || change.type === "same") return null;
  if (change.type === "new") {
    return (
      <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 shrink-0">
        NEW
      </span>
    );
  }
  const isUp = change.type === "up";
  return (
    <span
      className={`text-[11px] font-semibold tabular-nums shrink-0 ${
        isUp ? "text-rose-600 dark:text-rose-400" : "text-zinc-400 dark:text-zinc-500"
      }`}
      aria-label={isUp ? `${change.delta}계단 상승` : `${change.delta}계단 하락`}
    >
      {isUp ? "▲" : "▼"}
      {change.delta}
    </span>
  );
}

function KeywordCard({
  item,
  change,
}: {
  item: Keyword;
  change?: RankChange;
}) {
  const isTop = item.rank === 1;
  return (
    <details
      aria-label={`${item.rank}위 ${item.headline || item.word}`}
      className="group rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700"
    >
      <summary className={`cursor-pointer list-none select-none transition-colors active:bg-zinc-50 dark:active:bg-zinc-800/40 ${isTop ? "px-4 py-4" : "px-4 py-3.5"}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-md shrink-0 tabular-nums ${rankBadgeStyle(item.rank)}`}>
              {item.rank}
            </span>
            <RankChangeBadge change={change} />
            <div className="min-w-0">
              <p className={`${isTop ? "text-lg" : "text-sm"} font-semibold leading-snug line-clamp-2 break-keep tracking-tight`}>
                {item.headline || item.word}
              </p>
              {(item.description || item.articles[0]) && (
                <p className={`group-open:hidden mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed break-keep ${isTop ? "line-clamp-2" : "line-clamp-1"}`}>
                  {item.description || cleanTitle(item.articles[0].title)}
                </p>
              )}
            </div>
          </div>
          <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-600 text-xs shrink-0 transition-transform duration-200 group-open:rotate-180">▾</span>
        </div>
      </summary>

      <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-3.5 flex flex-col gap-3.5">
        {item.description && (
          <div className="border-l-2 border-rose-300 dark:border-rose-800 pl-3">
            <p className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 mb-1 tracking-wide">AI 요약</p>
            <p className="text-zinc-700 dark:text-zinc-200 text-sm leading-relaxed break-keep">
              {item.description}
            </p>
          </div>
        )}
        {item.articles.length > 0 && (
          <p className="text-[11px] font-semibold tracking-wide text-zinc-400 dark:text-zinc-500">
            관련 기사 {item.articles.length}
          </p>
        )}
        {item.articles.map((article, idx) => (
          <a
            key={idx}
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 group/link -mx-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40 active:bg-zinc-100 dark:active:bg-zinc-700/40"
          >
            <span className="text-zinc-400 dark:text-zinc-500 text-xs font-medium mt-0.5 shrink-0 w-3 tabular-nums">{idx + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="text-zinc-700 dark:text-zinc-200 text-sm leading-snug group-hover/link:text-rose-600 dark:group-hover/link:text-rose-400 group-hover/link:underline underline-offset-2 transition-colors break-keep">
                {cleanTitle(article.title)}
              </p>
              {article.source && (
                <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5">{article.source}</p>
              )}
            </div>
            <span className="text-zinc-300 dark:text-zinc-600 text-xs mt-0.5 shrink-0 group-hover/link:text-rose-600 dark:group-hover/link:text-rose-400 transition-colors" aria-hidden="true">↗</span>
          </a>
        ))}
        <Link
          href={`/keyword/${encodeURIComponent(item.word)}`}
          className="mt-0.5 inline-flex items-center justify-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          ‘{item.word}’ 키워드 추이 보기 →
        </Link>
      </div>
    </details>
  );
}

function SectionHeader({ category }: { category: string }) {
  return (
    <div className="flex items-baseline gap-2 mb-3.5">
      <span aria-hidden="true" className="text-sm">{categoryEmoji[category] || "📌"}</span>
      <h2 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{categoryLabel[category] || category}</h2>
      <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

function Summary({ summary }: { summary: string }) {
  if (!summary) return null;
  return (
    <p className="mb-4 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 break-keep">
      {summary}
    </p>
  );
}

// 단일 카테고리(카테고리 페이지) 및 토픽 그리드 칼럼에 쓰는 세로 리스트 섹션.
function CategorySection({
  category,
  categoryData,
  rankChanges,
}: {
  category: string;
  categoryData: CategoryData;
  rankChanges?: RankChanges;
}) {
  return (
    <section>
      <SectionHeader category={category} />
      <Summary summary={categoryData.summary} />
      <div className="flex flex-col gap-2.5">
        {categoryData.keywords.map((item) => (
          <KeywordCard
            key={item.word}
            item={item}
            change={rankChanges?.[category]?.[item.word]}
          />
        ))}
      </div>
    </section>
  );
}

// 전체 통합 핫이슈 = "급상승" 히어로. 1위는 풀폭으로 강조, 2~5위는 데스크탑에서 2열.
function RisingHero({
  category,
  categoryData,
  rankChanges,
}: {
  category: string;
  categoryData: CategoryData;
  rankChanges?: RankChanges;
}) {
  const [top, ...rest] = categoryData.keywords;
  return (
    <section className="mb-10">
      <div className="flex items-center gap-2.5 mb-3.5">
        <span aria-hidden="true" className="text-base">🔥</span>
        <h2 className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {categoryLabel[category] || category}
        </h2>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
          지금 뜨는 이슈
        </span>
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <Summary summary={categoryData.summary} />
      <div className="flex flex-col gap-2.5">
        {top && (
          <KeywordCard
            item={top}
            change={rankChanges?.[category]?.[top.word]}
          />
        )}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {rest.map((item) => (
              <KeywordCard
                key={item.word}
                item={item}
                change={rankChanges?.[category]?.[item.word]}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function KeywordDisplay({
  data,
  rankChanges,
}: {
  data: KeywordsData;
  rankChanges?: RankChanges;
}) {
  const entries = Object.entries(data.categories);

  const issueKeywords = data.categories[HERO_CATEGORY]?.keywords;
  const topIssue = issueKeywords?.find((k) => k.rank === 1) ?? issueKeywords?.[0];
  const topKeyword = topIssue ? topIssue.headline || topIssue.word : undefined;

  // 단일 카테고리(카테고리 페이지)는 풀폭 리스트로 렌더한다.
  if (entries.length <= 1) {
    const entry = entries[0];
    return (
      <>
        {entry && (
          <CategorySection category={entry[0]} categoryData={entry[1]} rankChanges={rankChanges} />
        )}
        <ShareButton topKeyword={topKeyword} />
      </>
    );
  }

  // 홈·날짜별: 급상승 히어로 + 경제/연예/스포츠 반응형 그리드.
  const heroEntry = entries.find(([name]) => name === HERO_CATEGORY);
  const topical = entries.filter(([name]) => name !== HERO_CATEGORY);

  return (
    <>
      {heroEntry && (
        <RisingHero category={heroEntry[0]} categoryData={heroEntry[1]} rankChanges={rankChanges} />
      )}

      <div className="flex justify-center my-2">
        <AdFitBanner adUnit="DAN-yItNPmN2B2cR2RlZ" width={300} height={250} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-8 mt-8">
        {topical.map(([category, categoryData]) => (
          <CategorySection
            key={category}
            category={category}
            categoryData={categoryData}
            rankChanges={rankChanges}
          />
        ))}
      </div>

      <ShareButton topKeyword={topKeyword} />
    </>
  );
}
