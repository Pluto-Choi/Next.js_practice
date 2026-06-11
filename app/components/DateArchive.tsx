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
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
            {label}
          </p>
          <ul className="flex flex-col">
            {days.map((entry) => {
              const { day, weekday } = parts(entry.date);
              return (
                <li key={entry.date}>
                  <Link
                    href={`/${entry.date}`}
                    className="group/day flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800/60 py-3 transition-colors"
                  >
                    <span className="w-12 shrink-0 text-sm font-semibold tabular-nums text-zinc-700 dark:text-zinc-200">
                      {day}일
                      <span className="ml-0.5 text-zinc-400 dark:text-zinc-500">{weekday}</span>
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[13px] text-zinc-500 dark:text-zinc-400 group-hover/day:text-orange-700 dark:group-hover/day:text-orange-400 transition-colors break-keep">
                      {entry.topWords.length > 0 ? entry.topWords.join(" · ") : "키워드 보기"}
                    </span>
                    <span aria-hidden="true" className="shrink-0 text-zinc-300 dark:text-zinc-600">
                      ›
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
