export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-lg mx-auto px-4 py-6 animate-pulse">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="h-7 w-32 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="flex gap-2 mb-6 justify-center">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-9 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>

        <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800 mb-3" />
        <div className="h-16 rounded-2xl bg-zinc-200 dark:bg-zinc-800 mb-4" />
        <div className="flex flex-col gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
          ))}
        </div>
      </div>
    </div>
  );
}
