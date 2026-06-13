import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

type PushSubscriptionJSON = {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

// 정식 웹푸시 서비스 도메인만 구독을 허용한다(저장소 없이 스팸 유입 차단).
const ALLOWED_PUSH_HOSTS = [
  "fcm.googleapis.com",
  "push.apple.com", // *.push.apple.com
  "notify.windows.com", // *.notify.windows.com
  "push.services.mozilla.com",
]

function isAllowedEndpoint(endpoint: string): boolean {
  try {
    const { protocol, hostname } = new URL(endpoint)
    if (protocol !== "https:") return false
    return ALLOWED_PUSH_HOSTS.some((h) => hostname === h || hostname.endsWith(`.${h}`))
  } catch {
    return false
  }
}

// IP당 간단한 슬라이딩 윈도(1분 20회). 서버리스 인스턴스 단위라 완벽하진 않지만
// 단일 출처의 폭주성 구독 스팸을 저비용으로 차단한다.
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60_000
const hits = new Map<string, number[]>()

function rateLimited(req: Request): boolean {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  // 메모리 누수 방지: 가끔 오래된 IP 정리.
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k)
  }
  return recent.length > RATE_LIMIT
}

// 푸시 구독 키는 base64url 고정 길이대(p256dh 87, auth 22 내외). 과대 입력 차단.
function isValidKey(v: unknown, max: number): v is string {
  return typeof v === "string" && v.length > 0 && v.length <= max
}

function supabaseHeaders() {
  return {
    apikey: SUPABASE_SERVICE_KEY as string,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
  }
}

export async function POST(req: Request) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'not configured' }, { status: 503 })
  }

  if (rateLimited(req)) {
    return NextResponse.json({ error: 'rate limited' }, { status: 429 })
  }

  let sub: PushSubscriptionJSON
  try {
    sub = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  if (!sub?.endpoint || !isValidKey(sub?.keys?.p256dh, 256) || !isValidKey(sub?.keys?.auth, 256)) {
    return NextResponse.json({ error: 'invalid subscription' }, { status: 400 })
  }

  if (typeof sub.endpoint !== "string" || sub.endpoint.length > 2048 || !isAllowedEndpoint(sub.endpoint)) {
    return NextResponse.json({ error: 'invalid endpoint' }, { status: 400 })
  }

  // upsert on endpoint conflict
  const res = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?on_conflict=endpoint`, {
    method: 'POST',
    headers: { ...supabaseHeaders(), Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
    }),
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'store failed' }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'not configured' }, { status: 503 })
  }

  if (rateLimited(req)) {
    return NextResponse.json({ error: 'rate limited' }, { status: 429 })
  }

  let body: { endpoint?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  // 구독 해지는 endpoint 문자열만으로 동작한다(브라우저가 자기 구독을 해지하는 정상 패턴).
  // 임의 입력으로 DB를 긁지 못하게 정식 푸시 엔드포인트 형식만 허용한다.
  if (!body?.endpoint || typeof body.endpoint !== "string" || body.endpoint.length > 2048 || !isAllowedEndpoint(body.endpoint)) {
    return NextResponse.json({ error: 'invalid endpoint' }, { status: 400 })
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(body.endpoint)}`,
    { method: 'DELETE', headers: supabaseHeaders() }
  )

  if (!res.ok) {
    return NextResponse.json({ error: 'delete failed' }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}
