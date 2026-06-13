import { notFound } from "next/navigation";
import type { Metadata } from "next";
import AppShell from "../../components/AppShell";
import { getAllKeywords, getKeywordDetail } from "../../data";
import { categoryEmoji, categoryLabel } from "../../categories";
import { cleanTitle } from "../../lib/format";

type Props = { params: Promise<{ term: string }> };

// 키워드는 빌드 시점 수집 데이터로 고정. 미생성 키워드는 온디맨드 렌더 대신 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getAllKeywords()).map((term) => ({ term }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { term } = await params;
  const detail = await getKeywordDetail(term);
  if (!detail) return { title: "왓뉴스" };
  const { word, headline, daysCount, peakRank } = detail;
  const title = `${headline || word} | 왓뉴스`;
  const description =
    detail.description ||
    `'${word}' 키워드는 최근 화제 키워드에 ${daysCount}회 올랐고 최고 ${peakRank}위를 기록했어요. 관련 뉴스와 순위 추이를 한눈에.`;
  return {
    title,
    description,
    alternates: { canonical: `/keyword/${encodeURIComponent(word)}` },
    openGraph: { title, description },
    twitter: { title, description },
  };
}

export default async function KeywordPage({ params }: Props) {
  const { term } = await params;
  const detail = await getKeywordDetail(term);
  if (!detail) notFound();

  const { word, headline, categories, latestDate, articles, description, sections, sources } = detail;
  const title = headline || word;
  const hasSections = !!sections && sections.length > 0;

  // 설명문은 "1문장=오늘의 사실 / 나머지=배경·맥락" 구조로 생성된다.
  // 그 구조를 살려 리드 문장과 본문 문단으로 나눠 가독성을 높인다.
  const descParts = description
    ? description.split(/(?<=다\.)\s+/).map((s) => s.trim()).filter(Boolean)
    : [];
  const descLead = descParts[0] ?? description;
  // 소제목 본문이 있으면 깊이는 소제목이 담당하므로 descRest는 생략한다(중복 방지).
  const descRest = hasSections ? "" : descParts.slice(1).join(" ");

  return (
    <AppShell>
      <div className="max-w-2xl lg:py-2">
        {/* === 문서 헤더 (노션 타이틀 블록) === */}
        <header className="mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3 text-xs text-zinc-500 dark:text-zinc-400">
            {categories.map((c) => (
              <span key={c} className="font-medium">
                {categoryEmoji[c] || "📌"} {categoryLabel[c] || c}
              </span>
            ))}
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{latestDate}</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold leading-snug tracking-tight break-keep">
            {title}
          </h1>
        </header>

        {/* === 본문 도입 (AI 요약) === */}
        {description && (
          <section className="mb-12">
            <p className="text-[17px] lg:text-lg font-bold leading-[1.85] text-zinc-800 dark:text-zinc-200 break-keep">
              {descLead}
            </p>
            {descRest && (
              <p className="mt-4 text-base leading-[1.85] text-zinc-800 dark:text-zinc-200 break-keep">
                {descRest}
              </p>
            )}
          </section>
        )}

        {/* === 소제목 본문 (급상승 키워드 전용, 웹 검색 근거) === */}
        {hasSections && (
          <div className="mb-12">
            {sections!.map((s) => (
              <section key={s.heading} className="mb-8 last:mb-0">
                <h2 className="text-lg lg:text-xl font-bold tracking-tight mb-3 break-keep">
                  {s.heading}
                </h2>
                <p className="text-base leading-[1.85] text-zinc-800 dark:text-zinc-200 break-keep">
                  {s.body}
                </p>
              </section>
            ))}
          </div>
        )}

        {/* === 출처 (웹 검색 근거) === */}
        {hasSections && sources && sources.length > 0 && (
          <section className="mb-12">
            <h2 className="text-sm font-bold tracking-tight mb-3 flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <span aria-hidden="true">🔎</span>출처
            </h2>
            <ul className="flex flex-col gap-1.5">
              {sources.map((src) => (
                <li key={src.url}>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-orange-700 dark:hover:text-orange-400 transition-colors break-all"
                  >
                    {src.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* === 관련 뉴스 === */}
        {articles.length > 0 && (
          <section className="mb-12">
            <h2 className="text-base font-bold tracking-tight mb-4 flex items-center gap-2">
              <span aria-hidden="true">📰</span>관련 뉴스
            </h2>
            <div className="flex flex-col">
              {articles.map((article) => (
                <a
                  key={article.link}
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link block py-3.5 border-b border-zinc-100 dark:border-zinc-800/60 first:pt-0 transition-colors"
                >
                  <p className="text-[15px] leading-snug text-zinc-800 dark:text-zinc-100 group-hover/link:text-orange-700 dark:group-hover/link:text-orange-400 transition-colors break-keep">
                    {cleanTitle(article.title)}
                  </p>
                  {article.source && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{article.source}</p>
                  )}
                </a>
              ))}
            </div>
          </section>
        )}

        <p className="text-zinc-400 dark:text-zinc-500 text-xs pb-4">
          누적 수집 데이터 기반 · Google News RSS
        </p>
      </div>
    </AppShell>
  );
}
