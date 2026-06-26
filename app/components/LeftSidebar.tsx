import Link from "next/link";
import { CATEGORIES, categoryLabel } from "../categories";

// 데스크탑 전용 좌측 사이드바. 스크롤해도 sticky로 유지(부가 네비/링크).
export default function LeftSidebar({
  className = "",
}: {
  className?: string;
}) {
  const navLink =
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 hover:text-orange-700 dark:hover:text-orange-400 transition-colors";
  const sectionLabel =
    "px-1 mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500";

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
                <span aria-hidden="true">🗃️</span>뉴스창고
              </Link>
            </li>
          </ul>
        </nav>

        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <p className="text-sm font-bold text-zinc-900 dark:text-white">📬 뉴스 구독</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            업데이트되는 핫이슈를 RSS로 받아보세요.
          </p>
          <a
            href="/rss.xml"
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-700 transition-colors"
          >
            <span aria-hidden="true">📡</span>RSS 구독하기
          </a>
        </div>
      </div>
    </aside>
  );
}
