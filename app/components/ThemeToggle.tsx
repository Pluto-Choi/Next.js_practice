"use client";

export default function ThemeToggle() {
  const toggle = () => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="absolute right-0 top-0 p-2 rounded-full text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
    >
      {/* 접근성 이름도 아이콘과 같은 방식으로 처리한다: aria-label을 JS 상태로
          만들면 다크 모드로 로드했을 때 하이드레이션 전까지 이름이 반대로
          읽힌다(달↔해 깜빡임의 스크린리더 판). .dark 클래스로 전환되는 sr-only
          라벨을 써서 첫 페인트부터 올바른 동작을 읽어 준다. */}
      <span className="sr-only dark:hidden">다크 모드로 전환</span>
      <span className="sr-only hidden dark:block">라이트 모드로 전환</span>
      {/* 아이콘은 .dark 클래스(인라인 스크립트가 하이드레이션 전 설정)에 따라
          CSS로 고른다 → 다크 모드로 로드해도 첫 페인트부터 올바른 아이콘이 뜬다
          (JS 마운트 전 달→해 깜빡임 제거). */}
      {/* 달: 라이트 상태 → 탭하면 다크로 전환 */}
      <svg className="block dark:hidden" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      {/* 해: 다크 상태 → 탭하면 라이트로 전환 */}
      <svg className="hidden dark:block" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    </button>
  );
}
