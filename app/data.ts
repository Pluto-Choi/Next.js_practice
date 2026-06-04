import { cache } from "react";
import { promises as fs } from "fs";
import path from "path";
import type { Article, KeywordsData } from "./components/KeywordDisplay";

const DATA_DIR = path.join(process.cwd(), "data");
const HISTORY_DIR = path.join(DATA_DIR, "history");
const DATE_RE = /^\d{4}-\d{2}-\d{2}\.json$/;

export const loadCurrentData = cache(async (): Promise<KeywordsData> => {
  const raw = await fs.readFile(path.join(DATA_DIR, "keywords.json"), "utf-8");
  return JSON.parse(raw);
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

export type KeywordDetail = {
  word: string;
  entries: TrendEntry[]; // 날짜 내림차순
  daysCount: number;
  peakRank: number;
  categories: string[];
  latestDate: string;
  description?: string;
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

  return {
    word,
    entries: sorted,
    daysCount: entries.length,
    peakRank: Math.min(...entries.map((e) => e.rank)),
    categories: [...new Set(entries.map((e) => e.category))],
    latestDate: latest.date,
    description: keyword?.description,
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
