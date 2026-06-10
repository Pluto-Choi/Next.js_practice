import Link from "next/link";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

// 전 페이지 공용 헤더. 모바일에선 스크롤해도 로고/테마토글이 따라오는
// 컴팩트 스티키 헤더, 데스크탑(lg+)은 정적 헤더로 둔다.
// widthClass로 안쪽 콘텐츠 폭을 페이지별 본문 폭과 맞춘다(테마토글 우측 정렬 기준).
export default function SiteHeader({ widthClass = "max-w-lg" }: { widthClass?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur lg:static lg:bg-transparent lg:backdrop-blur-none">
      <div className={`mx-auto ${widthClass} px-4 py-2.5 lg:pt-5 lg:pb-4`}>
        <div className="relative flex items-center justify-center">
          <Link href="/" aria-label="왓뉴스 홈" className="inline-flex">
            <Logo />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
