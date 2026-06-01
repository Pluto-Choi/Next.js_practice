import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { SITE_URL } from "./site";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-KGFN3B01DW";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "오늘의 뉴스 | 핫이슈 · 연예 · 경제 키워드",
  description: "오늘 가장 핫한 이슈, 연예, 경제 뉴스 키워드를 한눈에. 6시간마다 자동 업데이트.",
  keywords: ["오늘의 뉴스", "핫이슈", "연예 뉴스", "경제 키워드", "경제 뉴스", "트렌드 키워드", "오늘의 이슈", "K팝"],
  manifest: "/manifest.json",
  alternates: {
    types: {
      "application/rss+xml": [{ url: "/rss.xml", title: "오늘의 뉴스" }],
    },
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "512x512" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "오늘의 뉴스",
  },
  openGraph: {
    title: "오늘의 뉴스 | 핫이슈 · 연예 · 경제 키워드",
    description: "오늘 가장 핫한 이슈, 연예, 경제 뉴스 키워드를 한눈에. 6시간마다 자동 업데이트.",
    url: `${SITE_URL}/`,
    siteName: "오늘의 뉴스",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "오늘의 뉴스 | 핫이슈 · 연예 · 경제 키워드",
    description: "오늘 가장 핫한 이슈, 연예, 경제 뉴스 키워드를 한눈에. 6시간마다 자동 업데이트.",
  },
  verification: {
    google: [
      "Qf9yJ8A6MpHHWOtGlDYP3EtypiYmSG9j6LzoZlgEyPE",
      "5MgomuHpA7d3umCGiCPCGwYFxfDR-55op0Dgx8i-Hho",
    ],
    other: {
      "naver-site-verification": "b175ebe87bd866fe45c3baaa74e783adcb9b4d1f",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        {/* Pretendard를 렌더 비차단으로 로드한다 (media=print → onload 시 all). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css';l.media='print';l.onload=function(){this.media='all'};document.head.appendChild(l);})();`,
          }}
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
          />
        </noscript>
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
      <GoogleAnalytics gaId={GA_ID} />
    </html>
  );
}