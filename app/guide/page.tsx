import Link from "next/link";
import type { Metadata } from "next";
import Logo from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import { CATEGORIES, categoryLabel } from "../categories";

export const metadata: Metadata = {
  title: "이용 가이드 | 오늘의 뉴스",
  description: "오늘의 뉴스 사용법 — 키워드 카드 보는 법, 카테고리, 날짜별 보기, 트렌드, 알림, 공유까지 한눈에.",
  alternates: { canonical: "/guide" },
};

type Section = {
  emoji: string;
  title: string;
  body: React.ReactNode;
};

const SECTIONS: Section[] = [
  {
    emoji: "📰",
    title: "오늘의 뉴스란?",
    body: (
      <>
        Google News를 6시간마다 자동 분석해서 지금 가장 많이 다뤄지는 뉴스
        키워드를 카테고리별 TOP5로 추려 보여주는 서비스예요. 긴 기사를 다
        읽지 않아도 오늘 무슨 일이 있었는지 한눈에 파악할 수 있어요.
      </>
    ),
  },
  {
    emoji: "🔑",
    title: "키워드 카드 보는 법",
    body: (
      <>
        각 카드는 그날의 핵심 키워드예요. 카드를 누르면 펼쳐지면서, 오늘 이
        키워드가 왜 화제인지 짚어주는 설명과 함께 관련 기사 링크를 볼 수 있어요.
        설명에는 ‘며칠 연속 1위’ 같은 우리 사이트만의 트렌드 정보도 담겨요.
        키워드 옆 숫자는 순위이고,
        <span className="font-semibold text-rose-600 dark:text-rose-400"> ▲</span> /
        <span className="font-semibold text-zinc-400"> ▼</span> 배지는 어제 대비 순위
        변동을 뜻해요. <span className="font-semibold text-rose-600 dark:text-rose-400">NEW</span>는 오늘 새로
        올라온 키워드예요.
      </>
    ),
  },
  {
    emoji: "🗂️",
    title: "카테고리",
    body: (
      <>
        맨 위 <b>급상승</b>은 분야를 가리지 않고 지금 가장 화제인 이슈를 모아
        보여줘요. 그 아래로는 분야별 키워드가 이어져요.
        <span className="block mt-2 space-y-1">
          {CATEGORIES.map((c) => (
            <span key={c.slug} className="block">
              {c.emoji} <b>{categoryLabel[c.name] || c.name}</b>
            </span>
          ))}
        </span>
        <span className="block mt-2">
          상단의 카테고리 버튼을 누르면 해당 분야 키워드만 모아서 볼 수 있어요.
        </span>
      </>
    ),
  },
  {
    emoji: "📅",
    title: "날짜별로 보기",
    body: (
      <>
        상단 날짜 버튼으로 최근 며칠간의 키워드를 되돌아볼 수 있어요. 특정 날에
        어떤 이슈가 떴는지 기록처럼 확인할 수 있어요.
      </>
    ),
  },
  {
    emoji: "📊",
    title: "트렌드",
    body: (
      <>
        <Link href="/trends" className="underline underline-offset-2">
          트렌드 페이지
        </Link>
        에서는 어떤 키워드가 1위를 가장 오래 지켰는지 기간별(30·90·180·365일)로
        볼 수 있어요. 왜 화제였는지 AI 요약도 함께 제공해요.
      </>
    ),
  },
  {
    emoji: "🔔",
    title: "알림 받기",
    body: (
      <>
        홈 화면의 <b>설치</b> 버튼으로 앱처럼 설치하고, <b>알림</b> 버튼을 켜두면
        매일 정오에 그날의 키워드를 푸시로 받아볼 수 있어요. (iOS는 홈 화면에
        추가한 뒤 알림을 켤 수 있어요.)
      </>
    ),
  },
  {
    emoji: "🔗",
    title: "공유 · 구독",
    body: (
      <>
        공유 버튼으로 키워드를 친구에게 바로 보낼 수 있고,{" "}
        <Link href="/rss.xml" className="underline underline-offset-2">
          RSS 피드
        </Link>
        를 구독하면 즐겨 쓰는 리더로 새 키워드를 받아볼 수 있어요.
      </>
    ),
  },
  {
    emoji: "🌙",
    title: "다크 모드",
    body: (
      <>
        오른쪽 위 토글로 밝은/어두운 화면을 전환할 수 있어요. 선택은 기억돼서
        다음에 와도 그대로 유지돼요.
      </>
    ),
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <main id="main-content" tabIndex={-1} className="max-w-lg mx-auto px-4 py-6">
        <div className="relative mb-8 text-center">
          <ThemeToggle />
          <div className="flex justify-center mb-2">
            <Logo />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            ❓ 이용 가이드
          </p>
        </div>

        <div className="flex gap-2 mb-6 justify-center flex-wrap" role="navigation" aria-label="이동">
          <Link
            href="/"
            className="px-3 py-2.5 rounded-full text-xs font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors"
          >
            ← 오늘의 뉴스
          </Link>
        </div>

        <div className="space-y-3">
          {SECTIONS.map((s) => (
            <section
              key={s.title}
              className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4"
            >
              <h2 className="text-sm font-semibold mb-1.5">
                {s.emoji} {s.title}
              </h2>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {s.body}
              </p>
            </section>
          ))}
        </div>

        <p className="text-center text-zinc-500 dark:text-zinc-400 text-xs pt-6 pb-4">
          6시간마다 자동 업데이트 · Google News RSS 기반
        </p>
      </main>
    </div>
  );
}
