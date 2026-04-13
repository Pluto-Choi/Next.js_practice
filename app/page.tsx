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
      <div className="max-w-xl mx-auto px-4 py-8">

        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-1">
            📰 오늘의 뉴스
          </h1>
          <p className="text-base font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            내 주식이 떨어진 이유 📉
          </p>
          <p className="text-zinc-400 text-xs">{data.date} 기준</p>
        </div>

        {/* 카테고리별 키워드 */}
        {Object.entries(data.categories).map(([category, categoryData]) => (
          <div key={category} className="mb-8">

            {/* 카테고리 제목 */}
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
              <span>{categoryEmoji[category] || "📌"}</span>
              <span>{category}</span>
            </h2>

            {/* AI 요약 */}
            {categoryData.summary && (
              <div className="mb-3 px-3 py-2 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl">
                <p className="text-blue-700 dark:text-blue-300 text-xs font-medium leading-snug">
                  🤖 {categoryData.summary}
                </p>
              </div>
            )}

            {/* 키워드 목록 */}
            <div className="flex flex-col gap-2">
              {categoryData.keywords.map((item) => (
                <div
                  key={item.word}
                  className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800"
                >
                  {/* 키워드 헤더 */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-zinc-400 text-xs font-medium w-4">
                      {item.rank}
                    </span>
                    <span className={`text-lg font-bold ${rankColor(item.rank)}`}>
                      {item.word}
                    </span>
                  </div>

                  {/* 기사 목록 */}
                  <div className="flex flex-col gap-2">
                    {item.articles.map((article, idx) => (
                      <a
                        key={idx}
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 group"
                      >
                        <span className="text-zinc-400 text-xs mt-0.5 shrink-0">▸</span>
                        <div>
                          <p className="text-zinc-600 dark:text-zinc-300 text-sm group-hover:text-zinc-900 dark:group-hover:text-white transition-colors leading-snug">
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
                </div>
              ))}
            </div>
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
