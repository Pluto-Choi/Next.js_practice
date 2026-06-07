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

  let sub: PushSubscriptionJSON
  try {
    sub = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) {
    return NextResponse.json({ error: 'invalid subscription' }, { status: 400 })
  }

  if (!isAllowedEndpoint(sub.endpoint)) {
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

  let body: { endpoint?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }
  if (!body?.endpoint) {
    return NextResponse.json({ error: 'endpoint required' }, { status: 400 })
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
