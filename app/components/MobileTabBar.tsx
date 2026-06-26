"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CATEGORIES, categoryLabel } from "../categories";

// 모바일 전용 하단 탭바 + 카테고리 바텀시트.
// 엄지 도달성을 높이고 첫 화면을 콘텐츠로 채우기 위해 주요 네비를 하단으로 내린다.
// 데스크탑(lg+)에서는 좌우 사이드바가 그 역할을 하므로 숨긴다.

function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}
function IconGrid({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function IconCalendar({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v3M16 3v3" />
    </svg>
  );
}
function IconSearch({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export default function MobileTabBar() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // 시트 열릴 때 배경 스크롤 잠금 + ESC로 닫기.
  // 모달 다이얼로그이므로 열릴 때 포커스를 시트 안으로 옮기고, 닫힐 때
  // 트리거 버튼으로 되돌린다 (WCAG 2.4.3 포커스 관리).
  // Tab 포커스는 시트 안에서 순환시켜 배경으로 새지 않게 가둔다 (포커스 트랩).
  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSheetOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      triggerRef.current?.focus();
    };
  }, [sheetOpen]);

  // 라우트 이동 시 시트 닫기.
  useEffect(() => {
    setSheetOpen(false);
  }, [pathname]);

  const isHome = pathname === "/" || /^\/\d{4}-\d{2}-\d{2}$/.test(pathname);
  const isTrends = pathname.startsWith("/trends");
  const isCategory = pathname.startsWith("/category");

  const tabBase =
    "flex flex-1 flex-col items-center justify-center gap-0.5 h-full text-[10px] font-medium transition-colors";
  const tabOn = "text-orange-600 dark:text-orange-400";
  const tabOff = "text-zinc-500 dark:text-zinc-400";

  return (
    <>
      {/* 카테고리 바텀시트 */}
      {sheetOpen && (
        <div className="lg:hidden fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="카테고리">
          <div
            className="absolute inset-0 bg-black/40 animate-[fadeIn_0.15s_ease]"
            onClick={() => setSheetOpen(false)}
          />
          <div ref={panelRef} tabIndex={-1} className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-2 outline-none animate-[slideUp_0.22s_cubic-bezier(0.16,1,0.3,1)]">
            <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <p className="px-5 pb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
              카테고리
            </p>
            <nav className="grid grid-cols-2 gap-2 px-4">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="flex items-center gap-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-200 active:bg-zinc-50 dark:active:bg-zinc-800 transition-colors"
                >
                  <span aria-hidden="true" className="text-base">{c.emoji}</span>
                  {categoryLabel[c.name] || c.name}
                </Link>
              ))}
            </nav>
            <div className="mt-2 flex gap-2 px-4">
              <Link href="/trends" className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-200 active:bg-zinc-50 dark:active:bg-zinc-800 transition-colors">
                🗃️ 뉴스창고
              </Link>
              <Link href="/guide" className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-orange-200 dark:border-orange-800/60 bg-orange-50 dark:bg-orange-950/40 px-4 py-3 text-sm font-semibold text-orange-700 dark:text-orange-300 active:opacity-80 transition-opacity">
                ❓ 이용 가이드
              </Link>
            </div>
          </div>
        </div>
      )}

      <nav
        aria-label="모바일 메뉴"
        className="lg:hidden fixed inset-x-0 bottom-0 z-40 h-16 flex items-stretch border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
      >
        <Link href="/" aria-current={isHome ? "page" : undefined} className={`${tabBase} ${isHome ? tabOn : tabOff}`}>
          <IconHome active={isHome} />
          홈
        </Link>
        <button ref={triggerRef} type="button" onClick={() => setSheetOpen(true)} aria-haspopup="dialog" aria-expanded={sheetOpen} className={`${tabBase} ${isCategory ? tabOn : tabOff}`}>
          <IconGrid active={isCategory} />
          카테고리
        </button>
        <Link href="/trends" aria-current={isTrends ? "page" : undefined} className={`${tabBase} ${isTrends ? tabOn : tabOff}`}>
          <IconCalendar active={isTrends} />
          뉴스창고
        </Link>
        <Link href="/#search" className={`${tabBase} ${tabOff}`}>
          <IconSearch active={false} />
          검색
        </Link>
      </nav>
    </>
  );
}
