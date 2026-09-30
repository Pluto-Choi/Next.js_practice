import type { NextRequest } from "next/server";

// Vercel Cron(vercel.json, 05시대·17시대 KST)이 호출 → GitHub 수집 워크플로(collect.yml)를 깨운다.
// GitHub Actions 자체 schedule은 몇 시간씩 늦게 떠서 출퇴근 시간대를 놓치기 때문.
const DISPATCH_URL =
  "https://api.github.com/repos/Pluto-Choi/Next.js_practice/actions/workflows/collect.yml/dispatches";

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const res = await fetch(DISPATCH_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_DISPATCH_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({ ref: "main" }),
  });
  // 성공이면 GitHub는 204(본문 없음). 실패는 그대로 드러내 Vercel 크론 로그에서 보이게 한다.
  if (!res.ok) {
    return Response.json({ ok: false, status: res.status, detail: await res.text() }, { status: 502 });
  }
  return Response.json({ ok: true });
}
