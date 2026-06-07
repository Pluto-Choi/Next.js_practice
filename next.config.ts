import type { NextConfig } from "next";

const securityHeaders = [
  // MIME 스니핑 방지
  { key: "X-Content-Type-Options", value: "nosniff" },
  // 클릭재킹 방지 (iframe 임베드 차단)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // 외부로 리퍼러 최소 노출
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // 불필요한 브라우저 권한 차단
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
