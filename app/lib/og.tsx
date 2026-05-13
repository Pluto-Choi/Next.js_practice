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

  const issueKws = data.categories['오늘의 이슈']?.keywords.slice(0, 5) ?? []
  const entKws = data.categories['연예']?.keywords.slice(0, 3) ?? []
  const econKws = data.categories['경제']?.keywords.slice(0, 3) ?? []

  const badge = (rank: number) => ({
    fontSize: 13,
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: 999,
    backgroundColor: rank === 1 ? '#fbbf24' : '#27272a',
    color: rank === 1 ? '#713f12' : '#71717a',
    minWidth: 42,
    textAlign: 'center' as const,
  })

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#18181b',
          padding: '52px 64px',
          fontFamily: '"Noto Sans KR"',
        }}
      >
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, marginRight: 16 }}>
            <div style={{ width: 13, height: 22, backgroundColor: '#fb7185', borderRadius: 3 }} />
            <div style={{ width: 13, height: 34, backgroundColor: '#a78bfa', borderRadius: 3 }} />
            <div style={{ width: 13, height: 46, backgroundColor: '#60a5fa', borderRadius: 3 }} />
          </div>
          <span style={{ color: 'white', fontSize: 30, fontWeight: 700 }}>오늘의 뉴스</span>
          <span style={{ color: '#52525b', fontSize: 18, marginLeft: 'auto' }}>{data.date}</span>
        </div>

        {/* 세 칼럼 */}
        <div style={{ display: 'flex', gap: 36, flex: 1 }}>
          {/* 오늘의 이슈 */}
          <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <span style={{ fontSize: 18 }}>🔥</span>
              <span style={{ color: '#fb7185', fontSize: 16, fontWeight: 700 }}>오늘의 이슈</span>
            </div>
            {issueKws.map((kw) => (
              <div key={kw.word} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={badge(kw.rank)}>{kw.rank}위</span>
                <span style={{ color: kw.rank === 1 ? 'white' : '#d4d4d8', fontSize: kw.rank === 1 ? 24 : 18, fontWeight: 700 }}>
                  {kw.word}
                </span>
              </div>
            ))}
          </div>

          <div style={{ width: 1, backgroundColor: '#27272a', alignSelf: 'stretch' }} />

          {/* 연예 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <span style={{ fontSize: 18 }}>🎤</span>
              <span style={{ color: '#e879f9', fontSize: 16, fontWeight: 700 }}>연예</span>
            </div>
            {entKws.map((kw) => (
              <div key={kw.word} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={badge(kw.rank)}>{kw.rank}위</span>
                <span style={{ color: kw.rank === 1 ? 'white' : '#d4d4d8', fontSize: kw.rank === 1 ? 24 : 18, fontWeight: 700 }}>
                  {kw.word}
                </span>
              </div>
            ))}
          </div>

          <div style={{ width: 1, backgroundColor: '#27272a', alignSelf: 'stretch' }} />

          {/* 경제 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
              <span style={{ fontSize: 18 }}>💰</span>
              <span style={{ color: '#60a5fa', fontSize: 16, fontWeight: 700 }}>경제</span>
            </div>
            {econKws.map((kw) => (
              <div key={kw.word} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={badge(kw.rank)}>{kw.rank}위</span>
                <span style={{ color: kw.rank === 1 ? 'white' : '#d4d4d8', fontSize: kw.rank === 1 ? 24 : 18, fontWeight: 700 }}>
                  {kw.word}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 푸터 */}
        <div style={{ color: '#3f3f46', fontSize: 15, marginTop: 20 }}>
          3시간마다 자동 업데이트 · Google News RSS
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [{ name: 'Noto Sans KR', data: font, style: 'normal', weight: 700 }],
    }
  )
}
