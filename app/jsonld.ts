import type { KeywordsData } from "./components/KeywordDisplay";
import { SITE_URL as SITE } from "./site";

export function buildJsonLd(data: KeywordsData) {
  const itemLists = Object.entries(data.categories).map(([category, cat]) => ({
    "@type": "ItemList",
    name: `${data.date} ${category} 키워드 TOP${cat.keywords.length}`,
    description: cat.summary || undefined,
    numberOfItems: cat.keywords.length,
    itemListElement: cat.keywords.map((k) => ({
      "@type": "ListItem",
      position: k.rank,
      name: k.word,
    })),
  }));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE}/#org`,
        name: "오늘의 뉴스",
        url: `${SITE}/`,
        logo: `${SITE}/apple-touch-icon.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        url: `${SITE}/`,
        name: "오늘의 뉴스",
        alternateName: ["오늘의뉴스", "오늘 뉴스 키워드", "실시간 뉴스 키워드"],
        description:
          "오늘 가장 핫한 이슈, 연예, 경제 뉴스 키워드를 한눈에. 6시간마다 자동 업데이트.",
        inLanguage: "ko-KR",
        publisher: { "@id": `${SITE}/#org` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE}/keyword/{search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      ...itemLists,
    ],
  };
}
