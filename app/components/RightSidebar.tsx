import Link from "next/link";
import AdFitBanner from "./AdFitBanner";

// 데스크탑 전용 우측 사이드바. 스크롤해도 sticky 유지(부가 위젯/링크).
export default function RightSidebar({ className = "" }: { className?: string }) {
  const sectionLabel =
    "px-1 mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500";

  return (
    <aside aria-label="부가 정보" className={className}>
      <div className="flex flex-col gap-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto scrollbar-none pb-4">
        <div className="flex justify-center">
          <AdFitBanner adUnit="DAN-yItNPmN2B2cR2RlZ" width={300} height={250} />
        </div>
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
