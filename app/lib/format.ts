export const rankBadgeStyle = (rank: number) => {
  if (rank === 1) return "bg-amber-400 text-amber-950";
  if (rank <= 3) return "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200";
  return "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400";
};

export const cleanTitle = (title: string) => {
  const idx = title.lastIndexOf(" - ");
  return idx !== -1 ? title.slice(0, idx) : title;
};

// "YYYY-MM-DD HH:MM"(KST) 기준 현재로부터 경과 시간을 한국어로. 파싱 실패 시 null.
export const relativeTime = (updatedAt: string, now: Date = new Date()): string | null => {
  const parsed = new Date(updatedAt.replace(" ", "T"));
  if (Number.isNaN(parsed.getTime())) return null;
  const diffMin = Math.floor((now.getTime() - parsed.getTime()) / 60000);
  if (diffMin < 0) return "방금 전";
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}시간 전`;
  return `${Math.floor(diffHr / 24)}일 전`;
};
