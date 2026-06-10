import { ImageResponse } from 'next/og'
import type { KeywordsData } from '../components/KeywordDisplay'

export const ogSize = { width: 1200, height: 630 }

async function loadFont(): Promise<ArrayBuffer> {
  const css = await fetch(
    'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700',
    { headers: { 'User-Agent': 'Mozilla/5.0' } }
  ).then((r) => r.text())
  const url = css.match(/url\((https:\/\/[^)]+)\)/)?.[1]
  if (!url) throw new Error('font url not found')
  return fetch(url).then((r) => r.arrayBuffer())
}

export async function buildOgImage(data: KeywordsData) {
  const font = await loadFont()

  const text = (kw: { headline?: string; word: string }) => kw.headline || kw.word
  const issueKws = data.categories['오늘의 이슈']?.keywords.slice(0, 3) ?? []
  const entTop = data.categories['연예']?.keywords[0]
  const econTop = data.categories['경제']?.keywords[0]
  const sportsTop = data.categories['스포츠']?.keywords[0]

  const rankMark = (rank: number) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    borderRadius: 999,
    fontSize: 17,
    fontWeight: 700,
    backgroundColor: rank === 1 ? '#fbbf24' : '#27272a',
    color: rank === 1 ? '#713f12' : '#a1a1aa',
  })

  // 키워드가 없는 카테고리(예: 스포츠 미수집일)는 빈 라벨 행이 남지 않게 통째로 생략한다.
  const miniRow = (emoji: string, label: string, color: string, kw?: { headline?: string; word: string }) =>
    kw ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 96 }}>
          <span style={{ fontSize: 20 }}>{emoji}</span>
          <span style={{ color, fontSize: 18, fontWeight: 700 }}>{label}</span>
        </div>
        <span style={{ color: '#e4e4e7', fontSize: 24, fontWeight: 700, overflow: 'hidden' }}>
          {text(kw)}
        </span>
      </div>
    ) : null

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#18181b',
          padding: '48px 64px',
          fontFamily: '"Noto Sans KR"',
        }}
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
          <img
            width={46}
            height={46}
            style={{ marginRight: 14 }}
            src={`data:image/svg+xml,${encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><polyline points="5,9 12.5,29 20,15 27.5,31 33,8" fill="none" stroke="#ff5c2e" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="33" cy="8" r="3.6" fill="#ffb03a"/></svg>'
            )}`}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: 'white', fontSize: 30, fontWeight: 700, lineHeight: 1.1 }}>왓뉴스</span>
            <span style={{ color: '#a1a1aa', fontSize: 17, fontWeight: 400 }}>
              지금 한국에서 가장 핫한 뉴스 키워드
            </span>
          </div>
          <span style={{ color: '#52525b', fontSize: 18, marginLeft: 'auto' }}>{data.date}</span>
        </div>

        {/* 급상승 (주인공) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 22 }}>🔥</span>
          <span style={{ color: '#fb923c', fontSize: 19, fontWeight: 700 }}>급상승</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1 }}>
          {issueKws.map((kw) => (
            <div key={kw.word} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={rankMark(kw.rank)}>{kw.rank}</span>
              <span
                style={{
                  color: kw.rank === 1 ? 'white' : '#d4d4d8',
                  fontSize: kw.rank === 1 ? 38 : 28,
                  fontWeight: 700,
                  lineHeight: 1.15,
                  overflow: 'hidden',
                }}
              >
                {text(kw)}
              </span>
            </div>
          ))}
        </div>

        {/* 연예 · 경제 요약 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            paddingTop: 22,
            marginTop: 8,
            borderTop: '1px solid #27272a',
          }}
        >
          {miniRow('💰', '경제', '#a1a1aa', econTop)}
          {miniRow('🎤', '연예', '#a1a1aa', entTop)}
          {miniRow('⚽', '스포츠', '#a1a1aa', sportsTop)}
        </div>

        {/* 푸터 */}
        <div style={{ color: '#3f3f46', fontSize: 15, marginTop: 22 }}>
          6시간마다 자동 업데이트 · Google News RSS
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [{ name: 'Noto Sans KR', data: font, style: 'normal', weight: 700 }],
    }
  )
}
