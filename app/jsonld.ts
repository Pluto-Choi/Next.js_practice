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
        name: "왓뉴스",
        url: `${SITE}/`,
        logo: `${SITE}/apple-touch-icon.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        url: `${SITE}/`,
        name: "왓뉴스",
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

// <script> 태그에 안전하게 박기 위한 직렬화.
// 키워드는 뉴스 제목에서 오므로 '<'를 \u003c로 이스케이프해
// 데이터에 '</script>'가 섞여도 태그를 깨고 나오지 못하게 한다.
export function jsonLdHtml(data: KeywordsData): string {
  return JSON.stringify(buildJsonLd(data)).replace(/</g, "\\u003c");
}
