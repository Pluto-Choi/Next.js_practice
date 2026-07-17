"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES, categoryLabel } from "../categories";

// 데스크탑 전용 좌측 사이드바. 스크롤해도 sticky로 유지(부가 네비/링크).
export default function LeftSidebar({
  className = "",
}: {
  className?: string;
}) {
  const pathname = usePathname();
  // 지금 보고 있는 카테고리/뉴스창고를 강조해 "어디에 있는지"를 알려 준다
  // (모바일 카테고리 시트의 방향 표시와 동일한 오리엔테이션 패턴).
  const currentCatSlug = pathname.startsWith("/category/")
    ? decodeURIComponent(pathname.split("/")[2] ?? "")
    : "";
  const isTrends = pathname.startsWith("/trends");

  const navLink =
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 hover:text-orange-700 dark:hover:text-orange-400 transition-colors";
  const navLinkActive =
    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 transition-colors";
  const sectionLabel =
    "px-1 mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500";

  return (
    <aside aria-label="사이트 메뉴" className={className}>
      <div className="flex flex-col gap-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto scrollbar-none pb-4">
        <nav aria-label="카테고리">
          <p className={sectionLabel}>카테고리</p>
          <ul className="flex flex-col gap-0.5">
            {CATEGORIES.map((c) => {
              const on = c.slug === currentCatSlug;
              return (
                <li key={c.slug}>
                  <Link
                    href={`/category/${c.slug}`}
                    aria-current={on ? "page" : undefined}
                    className={on ? navLinkActive : navLink}
                  >
                    <span aria-hidden="true">{c.emoji}</span>
                    {categoryLabel[c.name] || c.name}
                  </Link>
                </li>
              );
            })}
            <li>
              <Link
                href="/trends"
                aria-current={isTrends ? "page" : undefined}
                className={isTrends ? navLinkActive : navLink}
              >
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
