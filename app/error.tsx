'use client'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-4xl mb-4">😵</p>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">
          문제가 발생했어요
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          일시적인 오류일 수 있어요. 다시 시도하거나 홈으로 돌아가 주세요.
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:opacity-80 active:scale-95 transition-all"
          >
            다시 시도
          </button>
          <a
            href="/"
            className="px-5 py-2.5 rounded-full border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 text-sm font-medium hover:border-zinc-500 dark:hover:border-zinc-400 active:scale-95 transition-all"
          >
            홈으로
          </a>
        </div>
      </div>
    </div>
  )
}
