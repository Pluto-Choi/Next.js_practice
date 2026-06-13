import { cache } from "react";
import { promises as fs } from "fs";
import path from "path";
import type { Article, KeywordsData, KeywordSection, KeywordSource } from "./components/KeywordDisplay";
import { HERO_CATEGORY } from "./categories";

const DATA_DIR = path.join(process.cwd(), "data");
const HISTORY_DIR = path.join(DATA_DIR, "history");
const DATE_RE = /^\d{4}-\d{2}-\d{2}\.json$/;

export const loadCurrentData = cache(async (): Promise<KeywordsData> => {
  const raw = await fs.readFile(path.join(DATA_DIR, "keywords.json"), "utf-8");
  return JSON.parse(raw);
});

// 본문(소제목) 데이터는 keywords.json과 분리해 side file로 관리한다.
// 수집(collect.py)은 keywords.json을 매번 덮어쓰지만 sections.json은 건드리지 않으므로,
// 구독 플랜으로 로컬 생성한 본문이 수집 주기와 무관하게 보존된다.
type SectionEntry = {
  sections: KeywordSection[];
  sources?: KeywordSource[];
  generated_at?: string;
};

export const loadSections = cache(async (): Promise<{ [word: string]: SectionEntry }> => {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, "sections.json"), "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
});

export type TrendEntry = {
  date: string;
  category: string;
  rank: number;
  count: number;
};

export type Streak = {
  word: string;
  category: string;
  streak: number;
  start: string;
  end: string;
  ai_summary: string | null;
};

export type TrendsData = {
  generated_at: string;
  days: number;
  keywords: { [word: string]: TrendEntry[] };
  streaks: { [period: string]: Streak[] };
};

export const loadTrends = cache(async (): Promise<TrendsData | null> => {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, "trends.json"), "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
});

export const loadHistoryData = cache(async (date: string): Promise<KeywordsData | null> => {
  // 경로 조작 방지: YYYY-MM-DD 형식만 파일 시스템에 닿게 한다(심층 방어).
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  try {
    const raw = await fs.readFile(path.join(HISTORY_DIR, `${date}.json`), "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
});

async function listHistoryDates(): Promise<string[]> {
  try {
    const files = await fs.readdir(HISTORY_DIR);
    return files
      .filter((f) => DATE_RE.test(f))
      .map((f) => f.replace(".json", ""))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

export async function getRecentDates(limit = 7): Promise<string[]> {
  return (await listHistoryDates()).slice(0, limit);
}

export async function getAllDates(): Promise<string[]> {
  return listHistoryDates();
}

export async function getAllKeywords(): Promise<string[]> {
  const trends = await loadTrends();
  return trends ? Object.keys(trends.keywords) : [];
}

export type DateArchiveEntry = {
  date: string;
  topWords: string[]; // 그날 "오늘의 이슈" 상위 키워드 구(헤드라인 우선)
};

// 날짜별 둘러보기용. 수집된 모든 날짜를 최신순으로, 각 날짜의 대표 이슈 키워드와 함께 반환한다.
export async function getDateArchive(): Promise<DateArchiveEntry[]> {
  const dates = await listHistoryDates();
  return Promise.all(
    dates.map(async (date) => {
      const data = await loadHistoryData(date);
      const issue = data?.categories[HERO_CATEGORY];
      const topWords = (issue?.keywords ?? [])
        .slice(0, 3)
        .map((k) => k.headline || k.word);
      return { date, topWords };
    }),
  );
}

export type KeywordDetail = {
  word: string;
  entries: TrendEntry[]; // 날짜 내림차순
  daysCount: number;
  peakRank: number;
  categories: string[];
  latestDate: string;
  description?: string;
  headline?: string;
  sections?: KeywordSection[];
  sources?: KeywordSource[];
  articles: Article[];
};

export const getKeywordDetail = cache(async (rawTerm: string): Promise<KeywordDetail | null> => {
  const trends = await loadTrends();
  if (!trends) return null;

  let word = rawTerm;
  let entries = trends.keywords[word];
  if (!entries) {
    try {
      word = decodeURIComponent(rawTerm);
      entries = trends.keywords[word];
    } catch {}
  }
  if (!entries || entries.length === 0) return null;

  const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  const latest = sorted[0];

  // 오늘 등장한 키워드는 history에 아직 없으므로 현재 데이터로 폴백.
  const source = (await loadHistoryData(latest.date)) ?? (await loadCurrentData().catch(() => null));
  const keyword = source?.categories[latest.category]?.keywords.find((k) => k.word === word);

  // 본문(소제목)은 side file(sections.json)에서 키워드 단어로 조회한다.
  // 없으면 description 폴백이 자동으로 동작한다(page.tsx의 hasSections 분기).
  const sectionEntry = (await loadSections())[word];

  return {
    word,
    entries: sorted,
    daysCount: entries.length,
    peakRank: Math.min(...entries.map((e) => e.rank)),
    categories: [...new Set(entries.map((e) => e.category))],
    latestDate: latest.date,
    description: keyword?.description,
    headline: keyword?.headline,
    sections: sectionEntry?.sections,
    sources: sectionEntry?.sources,
    articles: keyword?.articles ?? [],
  };
});

export type RankChange =
  | { type: "new" }
  | { type: "up" | "down"; delta: number }
  | { type: "same" };

export type RankChanges = {
  [category: string]: { [word: string]: RankChange };
};

/**
 * 주어진 날짜의 직전 history와 비교해 카테고리별 키워드 순위 변동을 계산한다.
 * date를 생략하면 현재 데이터(keywords.json)와 가장 최근 직전 날짜를 비교한다.
 */
export async function getRankChanges(current: KeywordsData): Promise<RankChanges> {
  const dates = await listHistoryDates();
  // current.date 이전의 가장 가까운 날짜를 찾는다 (같은 날짜 파일은 제외).
  const prevDate = dates.find((d) => d < current.date);
  if (!prevDate) return {};
  const prev = await loadHistoryData(prevDate);
  if (!prev) return {};

  const changes: RankChanges = {};
  for (const [category, catData] of Object.entries(current.categories)) {
    const prevRanks = new Map<string, number>();
    for (const k of prev.categories[category]?.keywords ?? []) {
      prevRanks.set(k.word, k.rank);
    }
    const catChanges: { [word: string]: RankChange } = {};
    for (const k of catData.keywords) {
      const before = prevRanks.get(k.word);
      if (before === undefined) {
        catChanges[k.word] = { type: "new" };
      } else if (before > k.rank) {
        catChanges[k.word] = { type: "up", delta: before - k.rank };
      } else if (before < k.rank) {
        catChanges[k.word] = { type: "down", delta: k.rank - before };
      } else {
        catChanges[k.word] = { type: "same" };
      }
    }
    changes[category] = catChanges;
  }
  return changes;
}
