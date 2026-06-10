export default function Logo() {
  return (
    <div className="inline-flex items-center gap-3" role="img" aria-label="오늘의 뉴스 로고">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect x="1" y="22" width="9" height="13" rx="2.5" className="fill-blue-200 dark:fill-blue-900" />
        <rect x="13.5" y="13" width="9" height="22" rx="2.5" className="fill-blue-400 dark:fill-blue-700" />
        <rect x="26" y="3" width="9" height="32" rx="2.5" className="fill-blue-500 dark:fill-blue-500" />
      </svg>
      <span className="text-3xl font-extrabold tracking-tight">오늘의 뉴스</span>
    </div>
  );
}
