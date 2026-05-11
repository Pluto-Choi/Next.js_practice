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
  title: "오늘의 뉴스 | 핫이슈 & 경제 키워드",
  description: "오늘 가장 핫한 이슈와 경제 뉴스 키워드를 한눈에. 매일 자동 업데이트.",
  keywords: ["오늘의 뉴스", "핫이슈", "경제 키워드", "경제 뉴스", "트렌드 키워드", "오늘의 이슈"],
  openGraph: {
    title: "오늘의 뉴스 | 핫이슈 & 경제 키워드",
    description: "오늘 가장 핫한 이슈와 경제 뉴스 키워드를 한눈에. 매일 자동 업데이트.",
    url: "https://whymystockisboom.vercel.app/",
    siteName: "오늘의 뉴스",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "오늘의 뉴스 | 핫이슈 & 경제 키워드",
    description: "오늘 가장 핫한 이슈와 경제 뉴스 키워드를 한눈에. 매일 자동 업데이트.",
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