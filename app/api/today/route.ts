import { NextResponse } from "next/server";
import { loadCurrentData } from "../../data";
import { HERO_CATEGORY } from "../../categories";

// 데이터는 배포 시점에 고정(키워드 수집 → 커밋 → 재배포 주기와 동일).
export const dynamic = "force-static";

// 크롬 확장 등 외부에서 읽을 수 있도록 CORS 허용.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "public, max-age=600",
};

export async function GET() {
  const data = await loadCurrentData();
  const issue = data.categories[HERO_CATEGORY];
  return NextResponse.json(
    {
      date: data.date,
      updated_at: data.updated_at ?? null,
      keywords: (issue?.keywords ?? []).map((k) => ({
        rank: k.rank,
        word: k.word,
        description: k.description ?? null,
      })),
    },
    { headers: CORS }
  );
}
