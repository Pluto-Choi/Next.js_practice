// 왓뉴스 로고 — W 스파크라인 심볼 + 워드마크
// 사용: <Logo />  (헤더 기본)  /  <Logo size={28} />  /  <Logo symbolOnly />

interface LogoProps {
  /** 심볼 한 변의 px 크기. 워드마크는 비례해서 커짐 */
  size?: number;
  /** true면 심볼만 렌더링 (모바일 축소 헤더 등) */
  symbolOnly?: boolean;
  className?: string;
}

export default function Logo({ size = 32, symbolOnly = false, className = "" }: LogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 select-none ${className}`}
      role="img"
      aria-label="왓뉴스"
    >
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
        <polyline
          points="5,9 12.5,29 20,15 27.5,31 33,8"
          fill="none"
          stroke="#ff5c2e"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={33} cy={8} r={3.6} fill="#ffb03a" />
      </svg>
      {!symbolOnly && (
        <span
          className="font-extrabold tracking-tight text-zinc-900 dark:text-white"
          style={{ fontSize: size * 0.82, lineHeight: 1 }}
        >
          왓뉴스
        </span>
      )}
    </span>
  );
}
