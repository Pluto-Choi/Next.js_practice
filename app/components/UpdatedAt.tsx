"use client";

import { useEffect, useState } from "react";
import { relativeTime } from "../lib/format";

// 갱신 시각을 절대(SSR)로 먼저 보여주고, 마운트 후 "· N시간 전" 상대 표기를 덧붙인다.
// SSG 페이지에서 빌드 시점 상대시간이 굳지 않도록 클라이언트에서 계산한다.
export default function UpdatedAt({ updatedAt, date }: { updatedAt?: string; date: string }) {
  const [rel, setRel] = useState<string | null>(null);

  useEffect(() => {
    if (!updatedAt) return;
    const tick = () => setRel(relativeTime(updatedAt));
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [updatedAt]);

  return (
    <>
      {updatedAt ? `${updatedAt} 업데이트` : date}
      {rel && <span className="text-zinc-400 dark:text-zinc-500"> · {rel}</span>}
    </>
  );
}
