// JSON-LD(구조화 데이터) 공용 헬퍼.
// 홈/카테고리/날짜용은 app/jsonld.ts, 키워드 상세용은 app/keyword/[term]/jsonld.ts에서
// 이 헬퍼를 가져다 쓴다. (발행처 노드·직렬화 규칙을 한 곳에서 관리)
import { SITE_URL as SITE } from "../site";

// 사이트 발행처(Organization). @id로 NewsArticle.publisher 등에서 참조한다.
export const ORG_ID = `${SITE}/#org`;

export function orgNode() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: "왓뉴스",
    url: `${SITE}/`,
    logo: `${SITE}/apple-touch-icon.png`,
  };
}

// <script> 태그에 안전하게 박기 위한 직렬화.
// 키워드는 뉴스 제목에서 오므로 '<'를 \u003c로 이스케이프해
// 데이터에 '</script>'가 섞여도 태그를 깨고 나오지 못하게 한다.
export function serializeJsonLd(graph: unknown): string {
  return JSON.stringify(graph).replace(/</g, "\\u003c");
}
