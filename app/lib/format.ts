export const rankBadgeStyle = (rank: number) => {
  if (rank === 1) return "bg-yellow-400 text-yellow-900";
  if (rank === 2) return "bg-zinc-300 text-zinc-700 dark:bg-zinc-600 dark:text-zinc-100";
  if (rank === 3) return "bg-orange-300 text-orange-900 dark:bg-orange-700 dark:text-orange-100";
  return "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300";
};

export const cleanTitle = (title: string) => {
  const idx = title.lastIndexOf(" - ");
  return idx !== -1 ? title.slice(0, idx) : title;
};
