import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import KeywordDisplay, { type KeywordsData } from "../../components/KeywordDisplay";
import Logo from "../../components/Logo";
import { buildJsonLd } from "../../jsonld";
import { CATEGORIES, categoryBySlug } from "../../categories";
import { SITE_URL as SITE } from "../../site";
import { loadCurrentData, getRankChanges } from "../../data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = categoryBySlug(slug);
  if (!cat) return { title: "오늘의 뉴스" };
  const data = await loadCurrentData();
  const words = data.categories[cat.name]?.keywords.slice(0, 3).map((k) => k.word) ?? [];
  const kw = words.join(" · ");
  const title = `${cat.name} 키워드${kw ? ` | ${kw}` : ""} - 오늘의 뉴스`;
  const description = `오늘의 ${cat.name} 뉴스 키워드 TOP5.${kw ? ` ${kw} 등.` : ""} 6시간마다 자동 업데이트.`;
  return {
    title,
    description,
    alternates: { canonical: `/category/${slug}` },
    openGraph: { title, description, url: `${SITE}/category/${slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = categoryBySlug(slug);
  if (!cat) notFound();

  const data = await loadCurrentData();
  const catData = data.categories[cat.name];
  if (!catData) notFound();

  const single: KeywordsData = { date: data.date, categories: { [cat.name]: catData } };
  const rankChanges = await getRankChanges(single);
  const jsonLd = buildJsonLd(single);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-lg mx-auto px-4 py-6">

        <h1 className="sr-only">{cat.name} 뉴스 키워드 TOP5 — {data.date}</h1>

        <div className="mb-8 text-center">
          <div className="flex justify-center mb-2">
            <Logo />
          </div>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            {data.date} · {cat.emoji} {cat.name}
          </p>
        </div>

        <div className="flex gap-2 mb-6 justify-center flex-wrap" role="navigation" aria-label="카테고리 선택">
          <Link
            href="/"
            className="px-3 py-2.5 rounded-full text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
          >
            전체
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className={`px-3 py-2.5 rounded-full text-xs font-medium transition-colors ${
                c.slug === slug
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold"
                  : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500"
              }`}
            >
              {c.emoji} {c.name}
            </Link>
          ))}
        </div>

        <KeywordDisplay data={single} rankChanges={rankChanges} />

        <p className="text-center text-zinc-400 text-xs pb-4">
          6시간마다 자동 업데이트 · Google News RSS 기반
        </p>
      </div>
    </div>
  );
}
