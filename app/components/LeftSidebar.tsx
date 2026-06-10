import Link from "next/link";
import { CATEGORIES, categoryLabel } from "../categories";

// 데스크탑 전용 좌측 사이드바. 스크롤해도 sticky로 유지(부가 네비/링크).
export default function LeftSidebar({
  recentDates,
  className = "",
}: {
  recentDates: string[];
  className?: string;
}) {
  const navLink =
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 hover:text-orange-700 dark:hover:text-orange-400 transition-colors";
  const sectionLabel =
    "px-1 mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500";

  return (
    <aside aria-label="사이트 메뉴" className={className}>
      <div className="flex flex-col gap-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto scrollbar-none pb-4">
        <nav aria-label="카테고리">
          <p className={sectionLabel}>카테고리</p>
          <ul className="flex flex-col gap-0.5">
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/category/${c.slug}`} className={navLink}>
                  <span aria-hidden="true">{c.emoji}</span>
                  {categoryLabel[c.name] || c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/trends" className={navLink}>
                <span aria-hidden="true">📊</span>트렌드
              </Link>
            </li>
            <li>
              <Link href="/guide" className={navLink}>
                <span aria-hidden="true">❓</span>이용 가이드
              </Link>
            </li>
          </ul>
        </nav>

        {recentDates.length > 1 && (
          <nav aria-label="지난 뉴스">
            <p className={sectionLabel}>지난 뉴스</p>
            <ul className="flex flex-col gap-0.5">
              {recentDates.slice(1, 6).map((d) => (
                <li key={d}>
                  <Link href={`/${d}`} className={navLink}>
                    <span aria-hidden="true">🗓️</span>
                    {d}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <p className="text-sm font-bold text-zinc-900 dark:text-white">📬 뉴스 구독</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            매일 아침 핫이슈를 한눈에 받아보세요.
          </p>
          <p className="mt-2.5 text-lg font-extrabold tabular-nums text-orange-700 dark:text-orange-400">
            12,800
            <span className="ml-1 text-xs font-medium text-zinc-400 dark:text-zinc-500">구독</span>
          </p>
          <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">* 샘플 데이터</p>
        </div>
      </div>
    </aside>
  );
}
