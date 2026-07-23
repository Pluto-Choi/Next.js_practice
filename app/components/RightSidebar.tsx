import AdFitBanner from "./AdFitBanner";

// 데스크탑 전용 우측 사이드바. 스크롤해도 sticky 유지(광고 슬롯).
// 바로가기(RSS·이용 가이드)는 좌측 사이드바로 이동했다.
export default function RightSidebar({ className = "" }: { className?: string }) {
  return (
    <aside aria-label="부가 정보" className={className}>
      <div className="flex flex-col gap-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto scrollbar-none pb-4">
        <div className="flex justify-center">
          <AdFitBanner adUnit="DAN-yItNPmN2B2cR2RlZ" width={160} height={600} />
        </div>
      </div>
    </aside>
  );
}
