import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-4xl mb-4">🔍</p>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
          페이지를 찾을 수 없어요
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          주소가 바뀌었거나 아직 수집되지 않은 날짜·키워드일 수 있어요.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:opacity-80 transition-opacity"
        >
          오늘의 뉴스로 가기
        </Link>
      </div>
    </div>
  );
}
