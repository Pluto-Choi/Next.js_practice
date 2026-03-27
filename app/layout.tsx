import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "경제 트렌드 키워드 | 오늘의 핫 키워드", // SEO를 위한 제목 메타 태그
  description: "매일 자동 업데이트되는 경제 뉴스 트렌드 키워드. 전날 가장 많이 언급된 경제 키워드와 관련 기사를 한눈에 확인하세요.",  // SEO를 위한 설명 메타 태그
  keywords: ["경제 키워드", "경제 트렌드", "오늘의 뉴스", "경제 뉴스", "트렌드 키워드"],  // SEO를 위한 키워드 메타 태그
  openGraph: {   // Open Graph 메타 태그
    title: "경제 트렌드 키워드 | 오늘의 핫 키워드",
    description: "매일 자동 업데이트되는 경제 뉴스 트렌드 키워드",
    url: "https://whymystockisboom.vercel.app/",
    siteName: "경제 트렌드 키워드",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {  // Twitter 카드 메타 태그
    card: "summary",
    title: "경제 트렌드 키워드 | 오늘의 핫 키워드",
    description: "매일 자동 업데이트되는 경제 뉴스 트렌드 키워드",
  },
  verification: { // Google Search Console을 위한 사이트 소유권 확인 메타 태그
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
