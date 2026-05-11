export default function Logo() {
  return (
    <div className="inline-flex items-center gap-3">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect x="1" y="22" width="9" height="13" rx="2.5" fill="#fb7185" />
        <rect x="13.5" y="13" width="9" height="22" rx="2.5" fill="#a78bfa" />
        <rect x="26" y="3" width="9" height="32" rx="2.5" fill="#60a5fa" />
      </svg>
      <span className="text-3xl font-extrabold tracking-tight">오늘의 뉴스</span>
    </div>
  );
}
