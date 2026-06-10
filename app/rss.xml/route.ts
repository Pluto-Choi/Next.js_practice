import { SITE_URL as BASE_URL } from "../site";
import { loadCurrentData, loadHistoryData, getRecentDates } from "../data";
import type { KeywordsData } from "../components/KeywordDisplay";

export const dynamic = "force-static";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function topKeywords(data: KeywordsData): string {
  const parts: string[] = [];
  for (const [category, catData] of Object.entries(data.categories)) {
    const words = catData.keywords.slice(0, 5).map((k) => k.word).join(", ");
    if (words) parts.push(`[${category}] ${words}`);
  }
  return parts.join(" · ");
}

function itemFor(date: string, data: KeywordsData): string {
  const title = `${date} 왓뉴스 키워드`;
  const link = `${BASE_URL}/${date}`;
  const issue = data.categories["오늘의 이슈"];
  const summary = issue?.summary ? `${issue.summary} ` : "";
  const description = `${summary}${topKeywords(data)}`;
  const pubDate = new Date(`${date}T00:00:00+09:00`).toUTCString();
  return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <description>${escapeXml(description)}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
}

export async function GET() {
  const recentDates = await getRecentDates(14);
  const current = await loadCurrentData();

  const seen = new Set<string>();
  const items: string[] = [];

  // 현재 데이터(오늘)를 먼저 넣고, 같은 날짜의 history는 건너뛴다.
  if (current?.date) {
    items.push(itemFor(current.date, current));
    seen.add(current.date);
  }

  for (const date of recentDates) {
    if (seen.has(date)) continue;
    const data = await loadHistoryData(date);
    if (!data) continue;
    items.push(itemFor(date, data));
    seen.add(date);
  }

  const lastBuild = new Date().toUTCString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>왓뉴스 | 핫이슈 · 연예 · 경제 키워드</title>
    <link>${BASE_URL}</link>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>오늘 가장 핫한 이슈, 연예, 경제 뉴스 키워드를 한눈에. 6시간마다 자동 업데이트.</description>
    <language>ko</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
