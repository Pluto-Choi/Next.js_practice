export const rankBadgeStyle = (rank: number) => {
  if (rank === 1) return "bg-amber-400 text-amber-950";
  if (rank <= 3) return "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-200";
  return "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400";
};

export const cleanTitle = (title: string) => {
  const idx = title.lastIndexOf(" - ");
  return idx !== -1 ? title.slice(0, idx) : title;
};
