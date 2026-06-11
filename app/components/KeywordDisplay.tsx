import Link from "next/link";
import ShareButton from "./ShareButton";
import type { RankChange, RankChanges } from "../data";
import { categoryEmoji, categoryLabel, categorySlug, HERO_CATEGORY } from "../categories";
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
      <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400 shrink-0">
        NEW
      </span>
    );
  }
  const isUp = change.type === "up";
  return (
    <span
      className={`text-[11px] font-semibold tabular-nums shrink-0 ${
        isUp ? "text-orange-700 dark:text-orange-400" : "text-zinc-400 dark:text-zinc-500"
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
      className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow dark:shadow-none"
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
                <p className={`group-open:hidden mt-1 text-[13px] lg:text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed break-keep ${isTop ? "line-clamp-2" : "line-clamp-1"}`}>
                  {item.description || cleanTitle(item.articles[0].title)}
                </p>
              )}
              {isTop && item.articles.length > 0 && (
                <p className="group-open:hidden mt-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                  관련 기사 {item.articles.length}건
                </p>
              )}
            </div>
          </div>
          <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-600 text-xs shrink-0 transition-transform duration-200 group-open:rotate-180">▾</span>
        </div>
      </summary>

      <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-3.5 flex flex-col gap-3.5">
        {item.description && (
          <div className="border-l-2 border-orange-300 dark:border-orange-800 pl-3">
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
        {item.articles.slice(0, 1).map((article, idx) => (
          <a
            key={idx}
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 group/link -mx-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40 active:bg-zinc-100 dark:active:bg-zinc-700/40"
          >
            <span className="text-zinc-400 dark:text-zinc-500 text-xs font-medium mt-0.5 shrink-0 w-3 tabular-nums">{idx + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="text-zinc-700 dark:text-zinc-200 text-sm leading-snug group-hover/link:text-orange-700 dark:group-hover/link:text-orange-400 group-hover/link:underline underline-offset-2 transition-colors break-keep">
                {cleanTitle(article.title)}
              </p>
              {article.source && (
                <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5">{article.source}</p>
              )}
            </div>
            <span className="text-zinc-300 dark:text-zinc-600 text-xs mt-0.5 shrink-0 group-hover/link:text-orange-700 dark:group-hover/link:text-orange-400 transition-colors" aria-hidden="true">↗</span>
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

// 카테고리는 있으나 오늘 수집된 키워드가 0개일 때(예: 스포츠 토픽피드 비수집일)
// 빈 화면 대신 안내를 보여준다.
function EmptyCategory({ category }: { category?: string }) {
  return (
    <section className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 px-6 py-12 text-center">
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {(category ? `${categoryLabel[category] || category} ` : "")}키워드를 준비 중이에요
      </p>
      <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500">
        6시간마다 자동 업데이트 · 다음 수집에서 채워집니다
      </p>
    </section>
  );
}

function Summary({ summary }: { summary: string }) {
  if (!summary) return null;
  return (
    <p className="mb-4 text-[13px] lg:text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 break-keep">
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
  const slug = categorySlug[category];
  return (
    <section id={slug ? `sec-${slug}` : undefined} className="scroll-mt-16">
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

// 랭킹 보드 한 줄. 순위 + 헤드라인 + 순위변동 화살표로 한눈에 스캔된다.
// 줄 전체가 해당 키워드 추이 페이지로 가는 링크.
function BoardRow({
  item,
  change,
  compact,
}: {
  item: Keyword;
  change?: RankChange;
  // compact: 분야별 보드에서 좁은 열에 맞게 서술형 헤드라인 대신 키워드 단어만 노출.
  compact?: boolean;
}) {
  const label = compact ? item.word : item.headline || item.word;
  return (
    <Link
      href={`/keyword/${encodeURIComponent(item.word)}`}
      aria-label={`${item.rank}위 ${item.headline || item.word}`}
      className="flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40 active:bg-zinc-100 dark:active:bg-zinc-700/40"
    >
      <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-md shrink-0 tabular-nums ${rankBadgeStyle(item.rank)}`}>
        {item.rank}
      </span>
      <span className="flex-1 min-w-0 truncate text-[15px] font-medium tracking-tight text-zinc-800 dark:text-zinc-100 hover:text-orange-700 dark:hover:text-orange-400">
        {label}
      </span>
      <RankChangeBadge change={change} />
    </Link>
  );
}

// 카테고리 하나를 순위 보드(카드 안 분할 리스트)로 렌더. 통합 급상승 보드와
// 분야별 스냅샷이 같은 행 컴포넌트를 공유해 밀도/모양을 일관되게 유지한다.
function RankBoard({
  category,
  categoryData,
  rankChanges,
  lead,
  showAllLink,
  compact,
}: {
  category: string;
  categoryData: CategoryData;
  rankChanges?: RankChanges;
  lead?: boolean;
  showAllLink?: boolean;
  compact?: boolean;
}) {
  const slug = categorySlug[category];
  return (
    <section id={slug ? `sec-${slug}` : undefined} className="scroll-mt-16">
      <div className="flex items-center gap-2 mb-2.5">
        <span aria-hidden="true" className={lead ? "text-base" : "text-sm"}>
          {categoryEmoji[category] || "📌"}
        </span>
        <h2 className={`font-bold tracking-tight text-zinc-900 dark:text-zinc-100 ${lead ? "text-base" : "text-sm"}`}>
          {categoryLabel[category] || category}
        </h2>
        {lead && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400">
            지금 뜨는 이슈
          </span>
        )}
        <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
        {showAllLink && slug && (
          <Link
            href={`/category/${slug}`}
            className="text-xs font-medium text-zinc-400 dark:text-zinc-500 hover:text-orange-700 dark:hover:text-orange-400 transition-colors shrink-0"
          >
            전체 보기 →
          </Link>
        )}
      </div>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none divide-y divide-zinc-100 dark:divide-zinc-800/60 overflow-hidden">
        {categoryData.keywords.map((item) => (
          <BoardRow
            key={item.word}
            item={item}
            change={rankChanges?.[category]?.[item.word]}
            compact={compact}
          />
        ))}
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
    const hasKeywords = !!entry && entry[1].keywords.length > 0;
    return (
      <>
        {hasKeywords ? (
          <CategorySection category={entry![0]} categoryData={entry![1]} rankChanges={rankChanges} />
        ) : (
          <EmptyCategory category={entry?.[0]} />
        )}
        <ShareButton topKeyword={topKeyword} />
      </>
    );
  }

  // 홈·날짜별: 통합 급상승 보드(오늘의 이슈)를 위에 두고, 그 아래 경제/연예/스포츠
  // 분야별 보드를 한 화면에 동시 노출 → 클릭·회전 없이 오늘 판세가 한눈에 읽힌다.
  // 빈 카테고리(예: 스포츠 미수집일)는 렌더에서 제외한다.
  const heroEntry = entries.find(([name]) => name === HERO_CATEGORY);
  const topical = entries.filter(([name, c]) => name !== HERO_CATEGORY && c.keywords.length > 0);

  return (
    <>
      {heroEntry && heroEntry[1].keywords.length > 0 && (
        <div className="mb-8">
          <RankBoard category={heroEntry[0]} categoryData={heroEntry[1]} rankChanges={rankChanges} lead />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
        {topical.map(([category, categoryData]) => (
          <RankBoard
            key={category}
            category={category}
            categoryData={categoryData}
            rankChanges={rankChanges}
            showAllLink
            compact
          />
        ))}
      </div>

      <ShareButton topKeyword={topKeyword} />
    </>
  );
}
