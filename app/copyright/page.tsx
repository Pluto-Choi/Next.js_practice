import type { Metadata } from "next";
import AppShell from "../components/AppShell";

export const metadata: Metadata = {
  title: "저작권 안내 | 왓뉴스",
  description:
    "왓뉴스는 공개 뉴스 피드를 집계해 키워드와 원문 링크를 제공하는 뉴스 큐레이션 서비스입니다. 기사 저작권은 각 언론사에 있습니다.",
  alternates: { canonical: "/copyright" },
};

type Section = { title: string; body: React.ReactNode };

// 저작권/권리 귀속 고지. 집계+링크 모델임을 명확히 하고, 권리침해 신고(takedown)
// 창구를 제공해 어그리게이터로서의 책임 관행을 갖춘다.
const SECTIONS: Section[] = [
  {
    title: "서비스의 성격",
    body: (
      <>
        왓뉴스는 Google News 등 공개된 뉴스 피드(RSS)를 매일 자동 집계해, 지금 화제인{" "}
        <b>키워드</b>와 <b>원문 기사로의 링크</b>를 제공하는 뉴스 큐레이션 서비스입니다.
        기사 본문 전체를 복제하거나 저장하지 않으며, 이용자를 원문 출처로 안내하는 것을
        목적으로 합니다.
      </>
    ),
  },
  {
    title: "저작권의 귀속",
    body: (
      <>
        표시되는 기사 제목·내용 및 그 저작권은 이를 보도한 각 언론사 및 저작권자에게
        있습니다. 왓뉴스는 출처(언론사명)와 원문 링크를 함께 제공하며, 자세한 내용은
        반드시 원문에서 확인하시기 바랍니다.
      </>
    ),
  },
  {
    title: "자체 생성 콘텐츠",
    body: (
      <>
        키워드별 요약·설명문과 ‘오늘의 브리핑’은 공개된 기사 제목 등을 근거로 본 서비스가
        자동 생성한 것으로, 사실 전달과 탐색 편의를 목적으로 합니다. 원문의 표현을 그대로
        옮기지 않으며, 정확한 사실은 원문 기사를 기준으로 합니다.
      </>
    ),
  },
  {
    title: "권리 침해 신고",
    body: (
      // TODO: 권리침해 신고 연락처(전용 이메일) 확정되면 아래에 추가.
      <>
        게시된 내용이 저작권 등 권리를 침해한다고 판단되시면 신고해 주세요. 확인 후 해당
        항목을 신속히 수정하거나 삭제하겠습니다. (신고 연락처는 곧 안내드릴 예정입니다.)
      </>
    ),
  },
  {
    title: "면책",
    body: (
      <>
        왓뉴스가 연결하는 외부 링크의 콘텐츠에 대한 책임은 해당 게시자에게 있으며, 집계
        과정에서 자동 생성된 정보에는 오류가 있을 수 있습니다. 중요한 판단은 원문을 통해
        직접 확인하시기 바랍니다.
      </>
    ),
  },
];

export default function CopyrightPage() {
  return (
    <AppShell>
      <div className="max-w-2xl">
        <p className="mb-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          ⚖️ 저작권 안내
        </p>

        <div className="space-y-3">
          {SECTIONS.map((s) => (
            <section
              key={s.title}
              className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4"
            >
              <h2 className="text-sm font-semibold mb-1.5">{s.title}</h2>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {s.body}
              </p>
            </section>
          ))}
        </div>

        <p className="text-center text-zinc-500 dark:text-zinc-400 text-xs pt-6 pb-4">
          기사 저작권은 각 언론사에 있습니다 · 왓뉴스는 키워드 집계와 원문 링크를 제공합니다
        </p>
      </div>
    </AppShell>
  );
}
