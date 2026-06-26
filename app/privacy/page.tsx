import type { Metadata } from "next";
import Link from "next/link";
import AppShell from "../components/AppShell";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 왓뉴스",
  description:
    "왓뉴스가 수집하는 개인정보 항목, 이용 목적, 처리위탁(분석·광고·푸시), 보유기간과 이용자 권리를 안내합니다.",
  alternates: { canonical: "/privacy" },
};

const EFFECTIVE = "2026-06-27";

type Section = { title: string; body: React.ReactNode };

// 개인정보처리방침. 실제 사용 중인 처리자(Vercel·Google·Kakao·Supabase) 기준으로 작성.
// ※ 표준 템플릿이며, 서비스 변경 시 갱신 필요. 법적 검토는 별도 권장.
const SECTIONS: Section[] = [
  {
    title: "1. 총칙",
    body: (
      <>
        왓뉴스(이하 “서비스”)는 별도의 회원가입 없이 이용할 수 있는 뉴스 키워드 큐레이션
        서비스입니다. 서비스 운영 과정에서 아래와 같이 최소한의 정보를 처리하며, 본 방침은
        이를 투명하게 안내하기 위한 것입니다.
      </>
    ),
  },
  {
    title: "2. 수집하는 항목 및 방법",
    body: (
      <>
        <b>가. 자동 수집 정보</b> — 서비스 이용 시 접속 기록, 기기·브라우저 정보, 쿠키 및
        유사 식별자, 페이지 이용 통계가 분석·광고 도구를 통해 자동으로 수집될 수 있습니다.
        <span className="mt-2 block">
          <b>나. 푸시 알림 구독 정보</b> — 이용자가 직접 알림을 켤 때에 한해, 브라우저가
          발급한 푸시 구독 정보(엔드포인트 주소 및 암호화 키)가 수집·저장됩니다. 이름·이메일
          등은 수집하지 않습니다.
        </span>
      </>
    ),
  },
  {
    title: "3. 이용 목적",
    body: (
      <>
        수집된 정보는 ① 서비스 이용 통계 분석 및 품질 개선, ② 광고 게재, ③ (구독 시) 뉴스
        키워드 푸시 알림 발송의 목적으로만 이용됩니다.
      </>
    ),
  },
  {
    title: "4. 처리위탁 및 국외 이전",
    body: (
      <>
        서비스는 운영을 위해 아래 사업자의 도구를 이용하며, 이 과정에서 일부 정보가 해당
        사업자(국외 포함)에서 처리될 수 있습니다.
        <span className="mt-2 block space-y-1">
          <span className="block">• <b>Vercel Inc.</b> (미국) — 호스팅, 방문·성능 분석</span>
          <span className="block">• <b>Google LLC</b> (미국) — Google Analytics 이용 통계</span>
          <span className="block">• <b>카카오</b> (대한민국) — 애드핏 광고 게재</span>
          <span className="block">• <b>Supabase Inc.</b> (국외) — 푸시 구독 정보 저장</span>
        </span>
        <span className="mt-2 block">
          각 사업자는 자체 개인정보 정책에 따라 정보를 처리합니다.
        </span>
      </>
    ),
  },
  {
    title: "5. 쿠키 등 자동 수집 도구",
    body: (
      <>
        분석·광고 도구는 이용자 식별 및 통계·광고 최적화를 위해 쿠키 또는 유사 식별자를
        사용할 수 있습니다. 이용자는 브라우저 설정에서 쿠키 저장을 거부하거나 삭제할 수
        있으며, 이 경우 일부 기능 이용이 제한될 수 있습니다.
      </>
    ),
  },
  {
    title: "6. 보유 및 파기",
    body: (
      <>
        푸시 구독 정보는 이용자가 알림을 끄거나 구독이 만료·무효화될 때까지 보유하며, 이후
        지체 없이 파기합니다. 분석·광고 도구가 수집한 정보의 보유 기간은 각 사업자의 정책을
        따릅니다.
      </>
    ),
  },
  {
    title: "7. 이용자의 권리",
    body: (
      <>
        이용자는 자신의 정보에 대한 열람·삭제를 요청할 수 있습니다. 푸시 알림은 브라우저의
        알림 설정을 끄거나 사이트의 알림 버튼을 다시 눌러 언제든지 구독을 해지할 수 있으며,
        해지 시 저장된 구독 정보는 삭제됩니다.
      </>
    ),
  },
  {
    title: "8. 문의",
    body: (
      // TODO: 개인정보 문의/권리행사 연락처(전용 이메일) 확정되면 추가.
      <>
        개인정보 처리에 관한 문의나 권리 행사는 아래로 요청하실 수 있습니다. (연락처는 곧
        안내드릴 예정입니다.)
        <span className="mt-2 block text-zinc-500 dark:text-zinc-400">
          관련 안내: <Link href="/copyright" className="underline underline-offset-2">저작권 안내</Link>
        </span>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <AppShell>
      <div className="max-w-2xl">
        <p className="mb-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          🔒 개인정보처리방침
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

        <p className="text-center text-zinc-400 dark:text-zinc-500 text-xs pt-6 pb-4">
          시행일: {EFFECTIVE}
        </p>
      </div>
    </AppShell>
  );
}
