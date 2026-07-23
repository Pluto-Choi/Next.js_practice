import type { ReactNode } from "react";
import SiteHeader from "./SiteHeader";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

// 데스크탑(lg+) 공용 셸: 헤더 + 좌/우 사이드바를 모든 페이지에서 동일하게 유지한다.
// 모바일에선 사이드바를 숨기고 본문만 1열로 보여준다(하단 탭바가 네비를 담당).
// 홈 그리드와 동일한 컬럼 구성을 써서 페이지 간 정렬을 맞춘다.
export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <SiteHeader widthClass="max-w-lg lg:max-w-7xl" />
      <div className="mx-auto max-w-lg lg:max-w-7xl px-4 py-3 lg:py-6 lg:grid lg:grid-cols-[30px_170px_24px_minmax(0,1fr)_24px_170px_30px] lg:gap-0 lg:items-start">
        <LeftSidebar className="hidden lg:block lg:col-start-2 lg:sticky lg:top-6" />
        <main id="main-content" tabIndex={-1} className="min-w-0 lg:col-start-4">
          {children}
        </main>
        <RightSidebar className="hidden lg:block lg:col-start-6 lg:sticky lg:top-6" />
      </div>
    </div>
  );
}
