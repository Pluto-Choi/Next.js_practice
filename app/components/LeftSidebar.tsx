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

        <nav aria-label="바로가기">
          <p className={sectionLabel}>바로가기</p>
          <div className="flex flex-col gap-0.5">
            <a href="/rss.xml" className={navLink}>
              <span aria-hidden="true">📡</span>RSS
            </a>
            <Link href="/guide" className={navLink}>
              <span aria-hidden="true">❓</span>이용 가이드
            </Link>
          </div>
        </nav>
      </div>
    </aside>
  );
}
