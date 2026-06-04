export const CATEGORIES = [
  { slug: "issue", name: "오늘의 이슈", emoji: "🔥" },
  { slug: "entertainment", name: "연예", emoji: "🎤" },
  { slug: "economy", name: "경제", emoji: "💰" },
] as const;

export function categoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export const categoryEmoji: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.name, c.emoji]),
);
