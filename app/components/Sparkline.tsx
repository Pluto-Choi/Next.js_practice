// 순위 시계열용 경량 SVG 스파크라인. 순위 1이 위쪽(작은 y)에 오도록 그린다.
export default function Sparkline({
  ranks,
  maxRank = 5,
  width = 72,
  height = 22,
}: {
  ranks: number[];
  maxRank?: number;
  width?: number;
  height?: number;
}) {
  if (ranks.length < 2) return null;

  const pad = 2;
  const n = ranks.length;
  const x = (i: number) => (i / (n - 1)) * (width - pad * 2) + pad;
  const y = (r: number) => ((r - 1) / Math.max(maxRank - 1, 1)) * (height - pad * 2) + pad;

  const points = ranks.map((r, i) => `${x(i).toFixed(1)},${y(r).toFixed(1)}`).join(" ");
  const last = ranks[n - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible text-zinc-400 dark:text-zinc-500"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={x(n - 1)} cy={y(last)} r="2" className="fill-rose-500 dark:fill-rose-400" />
    </svg>
  );
}
