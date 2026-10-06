import type { MetadataRoute } from 'next'
import { promises as fs } from 'fs'
import path from 'path'
import { CATEGORIES } from './categories'
import { SITE_URL as BASE_URL } from './site'
import { getAllKeywords, loadTrends } from './data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let dates: string[] = []
  const keywords = await getAllKeywords()
  // 키워드 페이지 lastmod = 마지막 등장일. 빌드 시각으로 일괄 찍으면 구글이 lastmod를 불신한다.
  const trends = await loadTrends()
  const lastSeen = (word: string) =>
    new Date(trends?.keywords[word]?.reduce((m, e) => (e.date > m ? e.date : m), '') || Date.now())
  try {
    const files = await fs.readdir(path.join(process.cwd(), 'data', 'history'))
    dates = files
      .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .map((f) => f.replace('.json', ''))
      .sort()
      .reverse()
  } catch {}

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    ...CATEGORIES.map((c) => ({
      url: `${BASE_URL}/category/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    })),
    {
      url: `${BASE_URL}/trends`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/guide`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    ...dates.map((date) => ({
      url: `${BASE_URL}/${date}`,
      lastModified: new Date(date),
      changeFrequency: 'never' as const,
      priority: 0.7,
    })),
    ...keywords.map((word) => ({
      url: `${BASE_URL}/keyword/${encodeURIComponent(word)}`,
      lastModified: lastSeen(word),
      changeFrequency: 'daily' as const,
      priority: 0.6,
    })),
  ]
}