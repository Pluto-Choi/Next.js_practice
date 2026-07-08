"use client";

import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        // JS scrollTo는 CSS의 prefers-reduced-motion 미디어쿼리에 걸리지 않으므로
        // 여기서 직접 확인한다. 동작 최소화 사용자에겐 부드러운 애니메이션 대신
        // 즉시 이동(WCAG 2.3.3).
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }}
      aria-label="맨 위로 이동"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-20 lg:bottom-5 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 bg-white/90 dark:bg-zinc-900/90 text-zinc-700 dark:text-zinc-200 shadow-lg backdrop-blur transition-all duration-200 hover:border-zinc-400 dark:hover:border-zinc-500 active:scale-95 ${
        visible ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 translate-y-2"
      }`}
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <span aria-hidden="true" className="text-lg leading-none">↑</span>
    </button>
  );
}
