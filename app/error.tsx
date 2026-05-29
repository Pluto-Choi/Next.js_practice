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
          잠시 후 다시 시도해 주세요.
        </p>
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium hover:opacity-80 transition-opacity"
        >
          다시 시도
        </button>
      </div>
    </div>
  )
}
