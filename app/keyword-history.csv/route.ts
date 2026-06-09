import { loadCurrentData, loadHistoryData, getAllDates } from "../data";
import type { KeywordsData } from "../components/KeywordDisplay";

export const dynamic = "force-static";

const HEADER = ["date", "category", "rank", "keyword", "headline", "count"];

function csvField(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rowsFor(data: KeywordsData): string[] {
  const rows: string[] = [];
  for (const [category, catData] of Object.entries(data.categories)) {
    for (const k of catData.keywords) {
      rows.push(
        [data.date, category, k.rank, k.word, k.headline ?? "", k.count]
          .map(csvField)
          .join(",")
      );
    }
  }
  return rows;
}

export async function GET() {
  const dates = await getAllDates(); // 최신순
  const current = await loadCurrentData().catch(() => null);

  const seen = new Set<string>();
  const lines: string[] = [HEADER.join(",")];

  // 오늘 데이터는 아직 history에 없을 수 있으므로 먼저 포함하고 같은 날짜는 건너뛴다.
  if (current?.date) {
    lines.push(...rowsFor(current));
    seen.add(current.date);
  }

  // 날짜 오름차순으로 정렬해 시계열로 읽기 쉽게 한다.
  for (const date of [...dates].sort()) {
    if (seen.has(date)) continue;
    const data = await loadHistoryData(date);
    if (!data) continue;
    lines.push(...rowsFor(data));
    seen.add(date);
  }

  // BOM을 붙여 엑셀에서 한글이 깨지지 않게 한다.
  const csv = "\uFEFF" + lines.join("\r\n") + "\r\n";

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="whatnewstoday-keyword-history.csv"',
    },
  });
}
