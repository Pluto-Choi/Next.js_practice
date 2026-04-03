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

type KeywordsData = {
  date: string;
  categories: {
    [category: string]: Keyword[];
  };
};

const categoryEmoji: { [key: string]: string } = {
  경제: "💰",
  IT: "💻",
  연예: "🎬",
};

const rankStyle = (rank: number) => {
  if (rank === 1) return "text-yellow-400";
  return "text-blue-400";
};

export default async function Home() {
  const filePath = path.join(process.cwd(), "data", "keywords.json");
  const raw = await fs.readFile(filePath, "utf-8");
  const data: KeywordsData = JSON.parse(raw);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white p-6">
      <div className="max-w-2xl mx-auto">

        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-1">
            📰 오늘의 뉴스
          </h1>
          <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400 mb-2">
            내 주식이 떨어진 이유 📉
          </p>
          <p className="text-zinc-400 text-sm">{data.date} 기준</p>
        </div>

        {/* 카테고리별 키워드 */}
        {Object.entries(data.categories).map(([category, keywords]) => (
          <div key={category} className="mb-8">
            {/* 카테고리 제목 */}
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <span>{categoryEmoji[category] || "📌"}</span>
              <span>{category}</span>
            </h2>

            {/* 키워드 목록 */}
            <div className="flex flex-col gap-3">
              {keywords.map((item) => (
                <div
                  key={item.word}
                  className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800"
                >
                  {/* 키워드 헤더 */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-zinc-400 text-sm font-medium w-4">
                      {item.rank}
                    </span>
                    <span className={`text-xl font-bold ${rankStyle(item.rank)}`}>
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
                        <span className="text-zinc-400 text-xs mt-1">▸</span>
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
        <p className="text-center text-zinc-400 text-xs mt-8">
          매일 자정 자동 업데이트 · Google News RSS 기반
        </p>
      </div>
    </div>
  );
}
