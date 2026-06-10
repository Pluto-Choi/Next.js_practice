import Link from "next/link";

// 한국 증시 관례: 상승=빨강, 하락=파랑. 더미(샘플) 데이터.
const INDICES = [
  { name: "코스피", value: "7,615.19", change: "-5.95%", down: true },
  { name: "코스닥", value: "938.87", change: "-2.99%", down: true },
  { name: "나스닥", value: "25,678.82", change: "-0.23%", down: true },
  { name: "원/달러", value: "1,386.50", change: "+0.42%", down: false },
  { name: "비트코인", value: "1.62억", change: "+1.10%", down: false },
];

const POPULAR = [
  "미국-이란 충돌",
  "스페이스X IPO",
  "WWDC 2026",
  "코스피 급락",
  "삼성 반도체 투자",
];

// 데스크탑 전용 우측 사이드바. 스크롤해도 sticky 유지(부가 위젯/링크).
export default function RightSidebar({ className = "" }: { className?: string }) {
  const sectionLabel =
    "px-1 mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500";

  return (
    <aside aria-label="부가 정보" className={className}>
      <div className="flex flex-col gap-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto scrollbar-none pb-4">
        <section>
          <p className={sectionLabel}>한눈에 보는 지수</p>
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
            {INDICES.map((ix) => (
              <div key={ix.name} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{ix.name}</span>
                <span className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                    {ix.value}
                  </span>
                  <span
                    className={`text-xs font-semibold tabular-nums ${
                      ix.down ? "text-blue-600 dark:text-blue-400" : "text-red-500 dark:text-red-400"
                    }`}
                  >
                    {ix.down ? "▼" : "▲"} {ix.change.replace(/^[-+]/, "")}
                  </span>
                </span>
              </div>
            ))}
          </div>
          <p className="mt-1 px-1 text-[10px] text-zinc-400 dark:text-zinc-500">* 샘플 데이터</p>
        </section>

        <section>
          <p className={sectionLabel}>실시간 인기 키워드</p>
          <ol className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
            {POPULAR.map((kw, i) => (
              <li key={kw}>
                <Link
                  href={`/keyword/${encodeURIComponent(kw)}`}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-600 dark:text-zinc-300 hover:text-orange-700 dark:hover:text-orange-400 transition-colors"
                >
                  <span className="w-4 shrink-0 text-xs font-bold tabular-nums text-orange-700 dark:text-orange-400">
                    {i + 1}
                  </span>
                  <span className="truncate">{kw}</span>
                </Link>
              </li>
            ))}
          </ol>
          <p className="mt-1 px-1 text-[10px] text-zinc-400 dark:text-zinc-500">* 샘플 데이터</p>
        </section>

        <section>
          <p className={sectionLabel}>바로가기</p>
          <div className="flex flex-col gap-0.5">
            <a
              href="/rss.xml"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 hover:text-orange-700 dark:hover:text-orange-400 transition-colors"
            >
              <span aria-hidden="true">📡</span>RSS 구독
            </a>
            <Link
              href="/guide"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 hover:text-orange-700 dark:hover:text-orange-400 transition-colors"
            >
              <span aria-hidden="true">❓</span>이용 가이드
            </Link>
          </div>
        </section>
      </div>
    </aside>
  );
}
