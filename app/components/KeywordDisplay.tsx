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

export type KeywordSection = {
  heading: string;
  body: string;
};

export type KeywordSource = {
  title: string;
  url: string;
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

export type Briefing = {
  text: string;
  period?: string;
  generated_at?: string;
};

export type KeywordsData = {
  date: string;
  updated_at?: string;
  briefing?: Briefing | null;
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
        isUp ? "text-orange-700 dark:text-orange-400" : "text-zinc-500 dark:text-zinc-500"
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
                <p className="group-open:hidden mt-1.5 text-[11px] font-medium text-zinc-500 dark:text-zinc-500">
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
            <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-500 mb-1 tracking-wide">AI 요약</p>
            <p className="text-zinc-700 dark:text-zinc-200 text-sm leading-relaxed break-keep">
              {item.description}
            </p>
          </div>
        )}
        {item.articles.length > 0 && (
          <p className="text-[11px] font-semibold tracking-wide text-zinc-500 dark:text-zinc-500">
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
            <span className="text-zinc-500 dark:text-zinc-500 text-xs font-medium mt-0.5 shrink-0 w-3 tabular-nums">{idx + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="text-zinc-700 dark:text-zinc-200 text-sm leading-snug group-hover/link:text-orange-700 dark:group-hover/link:text-orange-400 group-hover/link:underline underline-offset-2 transition-colors break-keep">
                {cleanTitle(article.title)}
              </p>
              {article.source && (
                <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-0.5">{article.source}</p>
              )}
            </div>
            <span className="sr-only"> (새 탭에서 원문 열기)</span>
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
      <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-500">
        매일 아침·저녁 자동 업데이트 · 다음 수집에서 채워집니다
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

// 랭킹 보드 한 줄. 줄 전체가 해당 키워드 추이 페이지로 가는 링크.
// 이슈(hero) 보드는 모든 순위가 "왜 떴나"(description)와 관련 기사 수를 함께 노출하는
// 맥락 행으로 통일한다. 분야별 스냅샷은 한 줄 컴팩트 행으로 렌더한다.
function BoardRow({
  item,
  hero,
}: {
  item: Keyword;
  // hero(급상승 보드): 1위는 틴트+보더로 강조, 나머지도 동일한 맥락 행으로 노출.
  hero?: boolean;
}) {
  const label = item.headline || item.word;
  const rank = item.rank;
  const isFirst = hero && rank === 1;
  const articleCount = item.articles?.length ?? 0;
  // 이슈 보드는 1위(hero)부터 하위까지 설명문이 있으면 모두 맥락 행으로 통일.
  const showContext = hero && !!item.description;

  if (showContext) {
    return (
      <Link
        href={`/keyword/${encodeURIComponent(item.word)}`}
        aria-label={`${rank}위 ${label}`}
        className={`block px-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40 active:bg-zinc-100 dark:active:bg-zinc-700/40 ${
          isFirst
            ? "py-4 border-l-2 border-orange-400 bg-orange-50/60 dark:border-orange-500 dark:bg-orange-950/20"
            : "py-3.5"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-md shrink-0 tabular-nums ${rankBadgeStyle(rank)}`}>
            {rank}
          </span>
          <h3 className={`min-w-0 flex-1 truncate tracking-tight ${isFirst ? "text-lg font-bold text-zinc-900 dark:text-white" : "text-[15px] font-semibold text-zinc-800 dark:text-zinc-100"}`}>
            {label}
          </h3>
          {articleCount > 0 && (
            <span className="shrink-0 text-[11px] text-zinc-500 dark:text-zinc-500">관련 {articleCount}건</span>
          )}
        </div>
        <p className="mt-1 pl-9 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400 break-keep line-clamp-2">
          {item.description}
        </p>
      </Link>
    );
  }

  // 컴팩트 행 (이슈 4위 이하 · 분야별 스냅샷): 한 줄 스캔.
  const labelCls = !hero
    ? "truncate text-[15px] font-medium text-zinc-800 dark:text-zinc-100"
    : "truncate text-[13px] font-normal text-zinc-500 dark:text-zinc-400";
  return (
    <Link
      href={`/keyword/${encodeURIComponent(item.word)}`}
      aria-label={`${rank}위 ${label}`}
      className="flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40 active:bg-zinc-100 dark:active:bg-zinc-700/40"
    >
      <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-md shrink-0 tabular-nums ${rankBadgeStyle(rank)}`}>
        {rank}
      </span>
      <span className={`flex-1 min-w-0 tracking-tight hover:text-orange-700 dark:hover:text-orange-400 ${labelCls}`}>
        {label}
      </span>
      {hero && articleCount > 0 && (
        <span className="shrink-0 text-[11px] text-zinc-500 dark:text-zinc-500">관련 {articleCount}건</span>
      )}
      {/* 모바일엔 hover가 없어 행이 링크임을 알기 어렵다. 연한 › 로 탭 가능 힌트. */}
      <span aria-hidden="true" className="shrink-0 text-zinc-300 dark:text-zinc-600 text-sm">›</span>
    </Link>
  );
}

// 카테고리별 색 액센트. 스크롤 중 "지금 어느 분야 보드인지" 즉시 인지시키되,
// 오렌지 중심 미니멀 톤을 깨지 않게 헤더의 얇은 바 + 라벨 색에만 쓴다.
const categoryAccent: Record<string, { bar: string; text: string }> = {
  "오늘의 이슈": { bar: "bg-orange-500", text: "text-orange-700 dark:text-orange-400" },
  경제: { bar: "bg-blue-500", text: "text-blue-700 dark:text-blue-400" },
  연예: { bar: "bg-pink-500", text: "text-pink-700 dark:text-pink-400" },
  스포츠: { bar: "bg-green-600", text: "text-green-700 dark:text-green-400" },
};
const accentDefault = { bar: "bg-zinc-400", text: "text-zinc-900 dark:text-zinc-100" };

// 카테고리 하나를 순위 보드(카드 안 분할 리스트)로 렌더. 통합 급상승 보드와
// 분야별 스냅샷이 같은 행 컴포넌트를 공유해 밀도/모양을 일관되게 유지한다.
function RankBoard({
  category,
  categoryData,
  lead,
  showAllLink,
  limit,
}: {
  category: string;
  categoryData: CategoryData;
  lead?: boolean;
  showAllLink?: boolean;
  // limit: 홈 분야 보드는 상위 N개 구만 노출, 나머지는 "전체 보기"로.
  limit?: number;
}) {
  const slug = categorySlug[category];
  const rows = limit ? categoryData.keywords.slice(0, limit) : categoryData.keywords;
  const accent = categoryAccent[category] ?? accentDefault;
  return (
    <section id={slug ? `sec-${slug}` : undefined} className="scroll-mt-16">
      <div className="flex items-center gap-2 mb-2.5">
        <span aria-hidden="true" className={`w-1 rounded-full shrink-0 ${lead ? "h-4" : "h-3.5"} ${accent.bar}`} />
        <span aria-hidden="true" className={lead ? "text-base" : "text-sm"}>
          {categoryEmoji[category] || "📌"}
        </span>
        <h2 className={`font-bold tracking-tight ${accent.text} ${lead ? "text-base" : "text-sm"}`}>
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
            className="text-xs font-medium text-zinc-500 dark:text-zinc-500 hover:text-orange-700 dark:hover:text-orange-400 transition-colors shrink-0"
          >
            전체 보기 →
          </Link>
        )}
      </div>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm dark:shadow-none divide-y divide-zinc-100 dark:divide-zinc-800/60 overflow-hidden">
        {rows.map((item) => (
          <BoardRow key={item.word} item={item} hero={lead} />
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
          <RankBoard category={heroEntry[0]} categoryData={heroEntry[1]} lead />
        </div>
      )}

      <div className="flex flex-col gap-5">
        {topical.map(([category, categoryData]) => (
          <RankBoard
            key={category}
            category={category}
            categoryData={categoryData}
            showAllLink
            limit={3}
          />
        ))}
      </div>

      <ShareButton topKeyword={topKeyword} />
    </>
  );
}
