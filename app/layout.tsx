import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "경제 트렌드 키워드 | 오늘의 핫 키워드",
  description: "매일 자동 업데이트되는 경제 뉴스 트렌드 키워드. 전날 가장 많이 언급된 경제 키워드와 관련 기사를 한눈에 확인하세요.",
  keywords: ["경제 키워드", "경제 트렌드", "오늘의 뉴스", "경제 뉴스", "트렌드 키워드"],
  openGraph: {
    title: "경제 트렌드 키워드 | 오늘의 핫 키워드",
    description: "매일 자동 업데이트되는 경제 뉴스 트렌드 키워드",
    url: "https://whymystockisboom.vercel.app/",
    siteName: "경제 트렌드 키워드",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "경제 트렌드 키워드 | 오늘의 핫 키워드",
    description: "매일 자동 업데이트되는 경제 뉴스 트렌드 키워드",
  },
  verification: {
    google: "Qf9yJ8A6MpHHWOtGlDYP3EtypiYmSG9j6LzoZlgEyPE",
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
      <body className="min-h-full flex flex-col">
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}