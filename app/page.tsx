import { promises as fs } from "fs";
import path from "path";

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
  경제: "💰",
  IT: "💻",
  연예: "🎬",
};

const rankColor = (rank: number) => {
  if (rank === 1) return "text-yellow-400";
  if (rank === 2) return "text-zinc-300";
  return "text-blue-400";
};

export default async function Home() {
  const filePath = path.join(process.cwd(), "data", "keywords.json");
  const raw = await fs.readFile(filePath, "utf-8");
  const data: KeywordsData = JSON.parse(raw);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <div className="max-w-xl mx-auto px-4 py-5">

        {/* 헤더 */}
        <div className="mb-5 text-center">
          <h1 className="text-xl font-bold mb-0.5">📰 오늘의 뉴스</h1>
          <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            내 주식이 떨어진 이유 📉
          </p>
          <p className="text-zinc-400 text-xs">{data.date} 기준</p>
        </div>

        {/* 카테고리별 키워드 */}
        {Object.entries(data.categories).map(([category, categoryData]) => (
          <div key={category} className="mb-5">

            {/* 카테고리 제목 */}
            <h2 className="text-base font-bold mb-1.5 flex items-center gap-1.5">
              <span>{categoryEmoji[category] || "📌"}</span>
              <span>{category}</span>
            </h2>

            {/* 키워드 목록 */}
            <div className="flex flex-col gap-1.5">
              {categoryData.keywords.map((item) => (
                <details
                  key={item.word}
                  className="group bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800"
                >
                  {/* 키워드 헤더 (항상 보임) */}
                  <summary className="cursor-pointer px-3 pt-2.5 pb-2 list-none">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400 text-xs font-medium w-4 shrink-0">
                          {item.rank}
                        </span>
                        <span className={`text-base font-bold ${rankColor(item.rank)}`}>
                          {item.word}
                        </span>
                        <span className="text-zinc-400 text-xs">
                          기사 {item.articles.length}건
                        </span>
                      </div>
                      <span className="text-zinc-400 text-xs transition-transform group-open:rotate-180 shrink-0">▾</span>
                    </div>
                    {/* 접힌 상태에서만 보이는 제목 미리보기 */}
                    {item.articles[0] && (
                      <p className="group-open:hidden mt-1 ml-6 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 leading-snug">
                        {item.articles[0].title}
                      </p>
                    )}
                  </summary>

                  {/* 기사 목록 (펼치면 보임) */}
                  <div className="px-3 pb-2.5 flex flex-col gap-1.5 border-t border-zinc-200 dark:border-zinc-800 pt-2">
                    {item.articles.map((article, idx) => (
                      <a
                        key={idx}
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 group/link"
                      >
                        <span className="text-zinc-400 text-xs mt-0.5 shrink-0">▸</span>
                        <div>
                          <p className="text-zinc-600 dark:text-zinc-300 text-sm group-hover/link:text-zinc-900 dark:group-hover/link:text-white transition-colors leading-snug">
                            {article.title}
                          </p>
                          {article.source && (
                            <p className="text-zinc-400 text-xs mt-0.5">
                              {article.source}
                            </p>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </details>
              ))}
            </div>

            {/* AI 요약 */}
            {categoryData.summary && (
              <div className="mt-2 px-3 py-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl">
                <p className="text-blue-700 dark:text-blue-300 text-xs leading-snug">
                  🤖 {categoryData.summary}
                </p>
              </div>
            )}
          </div>
        ))}

        {/* 푸터 */}
        <p className="text-center text-zinc-400 text-xs mt-4">
          매일 자정 자동 업데이트 · Google News RSS 기반
        </p>
      </div>
    </div>
  );
}
