// name = 저장 키(history/trends/keywords.json에서 영구 고정). 절대 바꾸지 않는다.
// label = 화면 표시 라벨(자유롭게 변경 가능). "오늘의 이슈"는 급상승 히어로로 노출한다.
export const CATEGORIES = [
  { slug: "issue", name: "오늘의 이슈", label: "급상승", emoji: "🔥" },
  { slug: "economy", name: "경제", label: "경제", emoji: "💰" },
  { slug: "entertainment", name: "연예", label: "연예", emoji: "🎤" },
  { slug: "sports", name: "스포츠", label: "스포츠", emoji: "⚽" },
] as const;

// 전체 통합 핫이슈를 뽑는 카테고리. 홈에서 상단 급상승 히어로로 강조한다.
export const HERO_CATEGORY = "오늘의 이슈";

export function categoryBySlug(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export const categoryEmoji: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.name, c.emoji]),
);

// 저장 키 → 화면 표시 라벨. 미등록 키는 키 자체를 라벨로 쓴다.
export const categoryLabel: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.name, c.label]),
);

// 저장 키 → slug. 홈 섹션 앵커(#sec-economy 등)에 쓴다.
export const categorySlug: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.name, c.slug]),
);
