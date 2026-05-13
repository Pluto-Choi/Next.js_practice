import type { MetadataRoute } from 'next'
import { promises as fs } from 'fs'
import path from 'path'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://whymystockisboom.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let dates: string[] = []
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
    ...dates.map((date) => ({
      url: `${BASE_URL}/${date}`,
      lastModified: new Date(date),
      changeFrequency: 'never' as const,
      priority: 0.7,
    })),
  ]
}