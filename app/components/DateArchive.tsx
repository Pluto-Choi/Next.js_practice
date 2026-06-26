import Link from "next/link";
import type { DateArchiveEntry } from "../data";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// YYYY-MM-DD를 UTC 기준으로 파싱해 빌드 타임존과 무관하게 요일/일자를 뽑는다.
function parts(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return { year: y, month: m, day: d, weekday };
}

// 날짜별 둘러보기. 수집된 모든 날짜를 월별로 묶고, 각 날짜에 그날의
// 대표 이슈 키워드를 미리보기로 붙여 "둘러볼 맛"을 준다.
export default function DateArchive({ entries }: { entries: DateArchiveEntry[] }) {
  // 월별 그룹화 (entries는 최신순 정렬되어 들어온다).
  const groups = new Map<string, DateArchiveEntry[]>();
  for (const entry of entries) {
    const { year, month } = parts(entry.date);
    const key = `${year}년 ${month}월`;
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(entry);
  }

  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold tracking-tight">
        <span aria-hidden="true">🗓</span>날짜별 뉴스
      </h2>

      {[...groups].map(([label, days]) => (
        <div key={label} className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
            {label}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {days.map((entry) => {
              const { day, weekday } = parts(entry.date);
              return (
                <Link
                  key={entry.date}
                  href={`/${entry.date}`}
                  className="group/day block rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3.5 shadow-sm dark:shadow-none hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
                >
                  <div className="mb-2.5 flex items-baseline gap-1.5">
                    <span className="text-sm font-bold tabular-nums text-zinc-800 dark:text-zinc-100">{day}일</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-500">{weekday}</span>
                  </div>
                  {entry.topWords.length > 0 ? (
                    <ol className="flex flex-col gap-2">
                      {entry.topWords.map((w, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-0.5 w-3.5 shrink-0 text-[11px] font-bold tabular-nums text-zinc-400 dark:text-zinc-500">{i + 1}</span>
                          <span className="min-w-0 flex-1 text-[13px] leading-snug text-zinc-700 dark:text-zinc-300 line-clamp-2 break-keep group-hover/day:text-orange-700 dark:group-hover/day:text-orange-400 transition-colors">{w}</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-[13px] text-zinc-400 dark:text-zinc-500">키워드 보기 ›</p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
