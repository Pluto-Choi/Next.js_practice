export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950">
      <div className="max-w-lg lg:max-w-5xl mx-auto px-4 py-6 animate-pulse">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="h-7 w-32 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>

        {/* 급상승 히어로 */}
        <div className="mb-10">
          <div className="h-4 w-28 rounded bg-zinc-200 dark:bg-zinc-800 mb-3.5" />
          <div className="h-20 rounded-xl bg-zinc-200 dark:bg-zinc-800 mb-2.5" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
            ))}
          </div>
        </div>

        {/* 토픽 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-8">
          {[0, 1, 2].map((col) => (
            <div key={col}>
              <div className="h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-800 mb-3.5" />
              <div className="flex flex-col gap-2.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
