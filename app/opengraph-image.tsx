import { promises as fs } from 'fs'
import path from 'path'
import { buildOgImage, ogSize } from './lib/og'
import type { KeywordsData } from './components/KeywordDisplay'

export const runtime = 'nodejs'
export const size = ogSize
export const contentType = 'image/png'

export default async function Image() {
  const raw = await fs.readFile(path.join(process.cwd(), 'data', 'keywords.json'), 'utf-8')
  const data: KeywordsData = JSON.parse(raw)
  return buildOgImage(data)
}
