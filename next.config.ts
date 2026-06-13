import type { NextConfig } from "next";

// CSP: 광고(AdFit)·GA가 런타임에 여러 도메인을 동적으로 부르므로 script/img/connect를
// 좁게 잠그면 광고·통계가 깨진다. 그래서 "광고·스크립트를 건드리지 않으면서도
// 효과가 큰" 디렉티브만 적용한다.
// - base-uri 'self': <base> 태그 주입으로 상대경로 자원을 탈취하는 공격 차단
// - object-src 'none': 플러그인(Flash 등) 임베드 차단
// - frame-ancestors 'self': 클릭재킹 방지(X-Frame-Options 보강, 최신 브라우저 기준)
// - form-action 'self': 폼 전송을 자기 출처로 제한(외부로 자격증명 탈취 방지)
// - upgrade-insecure-requests: 혼합 콘텐츠를 https로 자동 승격
const csp = [
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // MIME 스니핑 방지
  { key: "X-Content-Type-Options", value: "nosniff" },
  // 클릭재킹 방지 (iframe 임베드 차단)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // 외부로 리퍼러 최소 노출
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // 불필요한 브라우저 권한 차단
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // HTTPS 강제(1년) — 다운그레이드/중간자 공격 방지. preload는 되돌리기 어려워 제외.
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  // 콘텐츠 보안 정책 (광고/통계 무손상 범위의 고가치 디렉티브)
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
