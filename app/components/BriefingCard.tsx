import type { Briefing } from "./KeywordDisplay";

// 오늘의 브리핑 카드 — 전 카테고리 상위 키워드를 묶은 종합 요약(collect.py generate_briefing).
// briefing이 없으면(생성 실패·거절) 아무것도 렌더하지 않는다.
// 데스크탑/모바일 공용: 텍스트 분량만 다르고 레이아웃은 동일한 단일 카드.
export default function BriefingCard({ briefing }: { briefing?: Briefing | null }) {
  const text = briefing?.text?.trim();
  if (!text) return null;

  return (
    <section
      aria-label="오늘의 브리핑"
      className="rounded-2xl border border-orange-200 dark:border-orange-900/50 bg-gradient-to-b from-orange-50/80 to-white dark:from-orange-950/30 dark:to-zinc-900 p-4 lg:p-5 shadow-sm"
    >
      <div className="mb-2 flex items-center gap-1.5">
        <span aria-hidden="true" className="text-sm lg:text-base">🔥</span>
        <h2 className="text-[13px] lg:text-sm font-bold tracking-tight text-orange-800 dark:text-orange-300">
          오늘의 브리핑
        </h2>
        {briefing?.period && (
          <span className="text-[11px] lg:text-xs text-zinc-500 dark:text-zinc-400">{briefing.period}</span>
        )}
      </div>
      <p className="text-[15px] leading-7 text-zinc-800 dark:text-zinc-200 break-keep">
        {text}
      </p>
    </section>
  );
}
