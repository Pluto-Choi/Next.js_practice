import { Fragment } from "react";
import Link from "next/link";
import AdFitBanner from "./AdFitBanner";
import ShareButton from "./ShareButton";
import type { RankChange, RankChanges } from "../data";
import { categoryEmoji } from "../categories";
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

const categoryStyle: {
  [key: string]: {
    text: string;
    line: string;
    summaryBg: string;
    summaryBorder: string;
    summaryText: string;
  };
} = {
  "오늘의 이슈": {
    text: "text-rose-700 dark:text-rose-400",
    line: "bg-rose-400 dark:bg-rose-700",
    summaryBg: "bg-rose-50 dark:bg-rose-950/40",
    summaryBorder: "border-rose-200 dark:border-rose-900/60",
    summaryText: "text-rose-700 dark:text-rose-300",
  },
  연예: {
    text: "text-fuchsia-700 dark:text-fuchsia-400",
    line: "bg-fuchsia-400 dark:bg-fuchsia-700",
    summaryBg: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
    summaryBorder: "border-fuchsia-200 dark:border-fuchsia-900/60",
    summaryText: "text-fuchsia-700 dark:text-fuchsia-300",
  },
  경제: {
    text: "text-blue-600 dark:text-blue-400",
    line: "bg-blue-400 dark:bg-blue-700",
    summaryBg: "bg-blue-50 dark:bg-blue-950/40",
    summaryBorder: "border-blue-100 dark:border-blue-900/60",
    summaryText: "text-blue-600 dark:text-blue-300",
  },
};

const defaultCategoryStyle = {
  text: "text-zinc-500 dark:text-zinc-400",
  line: "bg-zinc-300 dark:bg-zinc-700",
  summaryBg: "bg-zinc-50 dark:bg-zinc-950/40",
  summaryBorder: "border-zinc-200 dark:border-zinc-900/60",
  summaryText: "text-zinc-600 dark:text-zinc-300",
};

function RankChangeBadge({ change }: { change?: RankChange }) {
  if (!change || change.type === "same") return null;
  if (change.type === "new") {
    return (
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 shrink-0">
        NEW
      </span>
    );
  }
  const isUp = change.type === "up";
  return (
    <span
      className={`text-[10px] font-bold tabular-nums shrink-0 ${
        isUp ? "text-rose-600 dark:text-rose-400" : "text-blue-600 dark:text-blue-400"
      }`}
      aria-label={isUp ? `${change.delta}계단 상승` : `${change.delta}계단 하락`}
    >
      {isUp ? "▲" : "▼"}
      {change.delta}
    </span>
  );
}

export default function KeywordDisplay({
  data,
  rankChanges,
}: {
  data: KeywordsData;
  rankChanges?: RankChanges;
}) {
  return (
    <>
      {Object.entries(data.categories).map(([category, categoryData], index) => {
        const style = categoryStyle[category] ?? defaultCategoryStyle;
        return (
          <Fragment key={category}>
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{categoryEmoji[category] || "📌"}</span>
                <h2 className={`text-sm font-bold tracking-wide ${style.text}`}>{category}</h2>
                <div className={`flex-1 h-px ${style.line} opacity-40`} />
              </div>

              {categoryData.summary && (
                <div className={`mb-4 px-4 py-3 ${style.summaryBg} border ${style.summaryBorder} rounded-2xl`}>
                  <p className={`${style.summaryText} text-xs leading-relaxed`}>
                    🤖 {categoryData.summary}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                {categoryData.keywords.map((item) => {
                  const isTop = item.rank === 1;
                  return (
                    <details
                      key={item.word}
                      aria-label={`${item.rank}위 ${item.word}`}
                      className={`group overflow-hidden rounded-2xl border bg-white dark:bg-zinc-900 transition-shadow ${
                        isTop
                          ? "border-yellow-300 dark:border-yellow-800 shadow-md"
                          : "border-zinc-100 dark:border-zinc-800 shadow-sm"
                      }`}
                    >
                      <summary className={`cursor-pointer list-none select-none transition-colors active:bg-zinc-50 dark:active:bg-zinc-800/40 ${isTop ? "px-4 py-4" : "px-4 py-3.5"}`}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${rankBadgeStyle(item.rank)}`}>
                              {item.rank}위
                            </span>
                            <RankChangeBadge change={rankChanges?.[category]?.[item.word]} />
                            <div className="min-w-0">
                              <p className={`${isTop ? "text-base" : "text-sm"} font-bold leading-tight truncate`}>
                                {item.word}
                              </p>
                              {(item.description || item.articles[0]) && (
                                <p className={`group-open:hidden mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 leading-snug ${isTop ? "line-clamp-2" : "line-clamp-1"}`}>
                                  {item.description || cleanTitle(item.articles[0].title)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center shrink-0">
                            <span className="text-zinc-300 dark:text-zinc-600 text-xs transition-transform duration-200 group-open:rotate-180">▾</span>
                          </div>
                        </div>
                      </summary>

                      <div className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/30 px-4 py-3 flex flex-col gap-3">
                        {item.description && (
                          <div className="overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
                            <div className={`flex items-center gap-1.5 px-3.5 pt-2.5 pb-1.5`}>
                              <span className="text-sm leading-none">🤖</span>
                              <span className={`text-[11px] font-bold tracking-wide ${style.summaryText}`}>AI 요약</span>
                            </div>
                            <div className="flex overflow-hidden">
                              <div className={`w-1 shrink-0 ${style.line}`} />
                              <p className="text-zinc-900 dark:text-zinc-50 text-[15px] font-medium leading-relaxed px-3.5 pb-3 pt-0.5">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        )}
                        {item.articles.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs leading-none">🔗</span>
                            <p className="text-[11px] font-semibold tracking-wide text-zinc-500 dark:text-zinc-400 uppercase">
                              관련 기사 {item.articles.length}건
                            </p>
                          </div>
                        )}
                        {item.articles.map((article, idx) => (
                          <a
                            key={idx}
                            href={article.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-3 group/link -mx-2 px-2 py-1.5 rounded-lg transition-colors hover:bg-white dark:hover:bg-zinc-900/60 active:bg-zinc-100 dark:active:bg-zinc-700/40"
                          >
                            <span className="text-zinc-400 dark:text-zinc-500 text-xs font-semibold mt-0.5 shrink-0 w-3 tabular-nums">{idx + 1}</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-zinc-700 dark:text-zinc-200 text-[13px] leading-snug group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 group-hover/link:underline underline-offset-2 transition-colors">
                                {cleanTitle(article.title)}
                              </p>
                              {article.source && (
                                <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-0.5">{article.source}</p>
                              )}
                            </div>
                            <span className="text-zinc-300 dark:text-zinc-600 text-xs mt-0.5 shrink-0 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors" aria-hidden="true">↗</span>
                          </a>
                        ))}
                        <Link
                          href={`/keyword/${encodeURIComponent(item.word)}`}
                          className="mt-1 inline-flex items-center justify-center gap-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
                        >
                          📈 ‘{item.word}’ 키워드 추이 보기
                        </Link>
                      </div>
                    </details>
                  );
                })}
              </div>

            </div>

            {index === 0 && (
              <AdFitBanner adUnit="DAN-yItNPmN2B2cR2RlZ" width={300} height={250} />
            )}
          </Fragment>
        );
      })}

      <ShareButton />
    </>
  );
}
