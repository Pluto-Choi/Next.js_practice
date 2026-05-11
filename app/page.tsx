import { promises as fs } from "fs";
import path from "path";
import { Fragment } from "react";
import AdFitBanner from "./components/AdFitBanner";
import Logo from "./components/Logo";
import ShareButton from "./components/ShareButton";

type Article = {
  title: string;
  link: string;
  source: string;
};

type Keyword = {
  rank: number;
  word: string;
  count: number;
  articles: Article[];
};

type CategoryData = {
  summary: string;
  keywords: Keyword[];
};

type KeywordsData = {
  date: string;
  categories: {
    [category: string]: CategoryData;
  };
};

const categoryEmoji: { [key: string]: string } = {
  "오늘의 이슈": "🔥",
  경제: "💰",
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
    text: "text-rose-500 dark:text-rose-400",
    line: "bg-rose-400 dark:bg-rose-700",
    summaryBg: "bg-rose-50 dark:bg-rose-950/40",
    summaryBorder: "border-rose-200 dark:border-rose-900/60",
    summaryText: "text-rose-700 dark:text-rose-300",
  },
  경제: {
    text: "text-blue-500 dark:text-blue-400",
    line: "bg-blue-400 dark:bg-blue-700",
    summaryBg: "bg-blue-50 dark:bg-blue-950/40",
    summaryBorder: "border-blue-100 dark:border-blue-900/60",
    summaryText: "text-blue-600 dark:text-blue-300",
  },
};

const cleanTitle = (title: string) => {
  const idx = title.lastIndexOf(' - ');
  return idx !== -1 ? title.slice(0, idx) : title;
};

const defaultCategoryStyle = {
  text: "text-zinc-500 dark:text-zinc-400",
  line: "bg-zinc-300 dark:bg-zinc-700",
  summaryBg: "bg-zinc-50 dark:bg-zinc-950/40",
  summaryBorder: "border-zinc-200 dark:border-zinc-900/60",
  summaryText: "text-zinc-600 dark:text-zinc-300",
};

const rankBadgeStyle = (rank: number) => {
  if (rank === 1) return "bg-yellow-400 text-yellow-900";
  if (rank === 2) return "bg-zinc-300 text-zinc-700 dark:bg-zinc-600 dark:text-zinc-100";
  if (rank === 3) return "bg-orange-300 text-orange-900 dark:bg-orange-700 dark:text-orange-100";
  return "bg-zinc-100 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400";
};

export default async function Home() {
  const filePath = path.join(process.cwd(), "data", "keywords.json");
  const raw = await fs.readFile(filePath, "utf-8");
  const data: KeywordsData = JSON.parse(raw);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* 헤더 */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-2">
            <Logo />
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">{data.date} · Google News RSS</p>
        </div>

        {/* 카테고리별 키워드 */}
        {Object.entries(data.categories).map(([category, categoryData], index) => {
          const style = categoryStyle[category] ?? defaultCategoryStyle;
          return (
            <Fragment key={category}>
              <div className="mb-8">

                {/* 카테고리 헤더 */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-base">{categoryEmoji[category] || "📌"}</span>
                  <h2 className={`text-sm font-bold tracking-wide ${style.text}`}>{category}</h2>
                  <div className={`flex-1 h-px ${style.line} opacity-40`} />
                </div>

                    {/* AI 요약 */}
                {categoryData.summary && (
                  <div className={`mb-4 px-4 py-3 ${style.summaryBg} border ${style.summaryBorder} rounded-2xl`}>
                    <p className={`${style.summaryText} text-xs leading-relaxed`}>
                      🤖 {categoryData.summary}
                    </p>
                  </div>
                )}

                {/* 키워드 카드 목록 */}
                <div className="flex flex-col gap-3">
                  {categoryData.keywords.map((item) => {
                    const isTop = item.rank === 1;
                    return (
                      <details
                        key={item.word}
                        className={`group overflow-hidden rounded-2xl border bg-white dark:bg-zinc-900 transition-shadow ${
                          isTop
                            ? "border-yellow-300 dark:border-yellow-800 shadow-md"
                            : "border-zinc-100 dark:border-zinc-800 shadow-sm"
                        }`}
                      >
                        {/* 카드 헤더 */}
                        <summary className={`cursor-pointer list-none select-none ${isTop ? "px-4 py-4" : "px-4 py-3.5"}`}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${rankBadgeStyle(item.rank)}`}>
                                {item.rank}위
                              </span>
                              <div className="min-w-0">
                                <p className={`${isTop ? "text-base" : "text-sm"} font-bold leading-tight truncate`}>
                                  {item.word}
                                </p>
                                {item.articles[0] && (
                                  <p className="group-open:hidden mt-0.5 text-xs text-zinc-400 dark:text-zinc-500 line-clamp-1 leading-snug">
                                    {cleanTitle(item.articles[0].title)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-xs text-zinc-400 dark:text-zinc-500">{item.articles.length}건</span>
                              <span className="text-zinc-300 dark:text-zinc-600 text-xs transition-transform duration-200 group-open:rotate-180">▾</span>
                            </div>
                          </div>
                        </summary>

                        {/* 기사 목록 */}
                        <div className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/30 px-4 py-3 flex flex-col gap-3">
                          {item.articles.map((article, idx) => (
                            <a
                              key={idx}
                              href={article.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start gap-3 group/link"
                            >
                              <span className="text-zinc-300 dark:text-zinc-600 text-xs font-medium mt-0.5 shrink-0 w-3">{idx + 1}</span>
                              <div className="min-w-0">
                                <p className="text-zinc-700 dark:text-zinc-300 text-sm leading-snug group-hover/link:text-zinc-950 dark:group-hover/link:text-white transition-colors">
                                  {cleanTitle(article.title)}
                                </p>
                                {article.source && (
                                  <p className="text-zinc-400 text-xs mt-0.5">{article.source}</p>
                                )}
                              </div>
                            </a>
                          ))}
                        </div>
                      </details>
                    );
                  })}
                </div>
                {/* 공유 버튼 */}
                <ShareButton
                  category={category}
                  summary={categoryData.summary ?? ''}
                  keywords={categoryData.keywords.map(k => ({ rank: k.rank, word: k.word }))}
                  date={data.date}
                />
              </div>

              {index === 0 && (
                <AdFitBanner adUnit="DAN-XXXXXXXXXX" width={300} height={250} />
              )}
            </Fragment>
          );
        })}

        {/* 푸터 */}
        <p className="text-center text-zinc-400 text-xs pb-4">
          매일 오전 9시 자동 업데이트 · Google News RSS 기반
        </p>
      </div>
    </div>
  );
}
