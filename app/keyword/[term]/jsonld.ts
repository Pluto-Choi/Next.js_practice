// 키워드 상세페이지(~255개 본문 페이지) 전용 구조화 데이터.
// 상세페이지(page.tsx)와 같은 폴더에 둬서, 페이지 구성이 바뀌면 여기도 같이 손본다.
//
// 홈/카테고리/날짜는 목록이라 ItemList(app/jsonld.ts)를 쓰지만,
// 개별 키워드 페이지는 본문을 가진 단일 문서이므로
// NewsArticle + BreadcrumbList로 검색(뉴스 리치 결과) 노출을 강화한다.
import type { KeywordDetail } from "../../data";
import { categoryLabel, categorySlug } from "../../categories";
import { SITE_URL as SITE } from "../../site";
import { orgNode, ORG_ID, serializeJsonLd } from "../../lib/structured-data";

type Crumb = { "@type": "ListItem"; position: number; name: string; item: string };

// NewsArticle 본문: 소제목 본문(sections)이 있으면 그걸 합쳐서, 없으면 description.
function articleBody(detail: KeywordDetail): string | undefined {
  const { sections, description } = detail;
  if (sections && sections.length > 0) {
    return sections.map((s) => `${s.heading}\n${s.body}`).join("\n\n");
  }
  return description;
}

// 빵부스러기: 홈 > (대표 카테고리) > 키워드.
function breadcrumbs(detail: KeywordDetail, title: string, url: string): Crumb[] {
  const crumbs: Crumb[] = [{ "@type": "ListItem", position: 1, name: "홈", item: `${SITE}/` }];
  const primaryCat = detail.categories[0];
  if (primaryCat && categorySlug[primaryCat]) {
    crumbs.push({
      "@type": "ListItem",
      position: 2,
      name: categoryLabel[primaryCat] || primaryCat,
      item: `${SITE}/category/${categorySlug[primaryCat]}`,
    });
  }
  crumbs.push({ "@type": "ListItem", position: crumbs.length + 1, name: title, item: url });
  return crumbs;
}

function newsArticleNode(detail: KeywordDetail, title: string, url: string) {
  const { word, description, latestDate } = detail;
  const body = articleBody(detail);
  return {
    "@type": "NewsArticle",
    "@id": `${url}#article`,
    headline: title,
    ...(description ? { description } : {}),
    ...(body ? { articleBody: body } : {}),
    datePublished: latestDate,
    dateModified: latestDate,
    inLanguage: "ko-KR",
    keywords: word,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}

export function buildKeywordJsonLd(detail: KeywordDetail) {
  const title = detail.headline || detail.word;
  const url = `${SITE}/keyword/${encodeURIComponent(detail.word)}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      orgNode(),
      newsArticleNode(detail, title, url),
      { "@type": "BreadcrumbList", itemListElement: breadcrumbs(detail, title, url) },
    ],
  };
}

export function keywordJsonLdHtml(detail: KeywordDetail): string {
  return serializeJsonLd(buildKeywordJsonLd(detail));
}
