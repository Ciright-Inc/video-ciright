import { Skeleton } from "@/components/ui/skeleton";

export default function WatchLoading() {
  return (
    <div className="mx-auto max-w-[1754px]">
      <div className="flex flex-col gap-4 xl:flex-row xl:gap-4">
        <div className="min-w-0 flex-1 xl:max-w-[calc(100%-424px)]">
          <Skeleton className="aspect-video w-full rounded-[var(--radius-lg)]" />
          <Skeleton className="mt-3 h-7 w-3/4" />
          <Skeleton className="mt-3 h-12 w-full" />
          <Skeleton className="mt-3 h-24 w-full rounded-[var(--radius-lg)]" />
          <Skeleton className="mt-6 h-8 w-40" />
          <Skeleton className="mt-6 h-10 w-full" />
        </div>
        <aside className="w-full shrink-0 xl:w-[402px]">
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-2">
                <Skeleton className="h-[94px] w-[168px] shrink-0 rounded-[var(--radius-md)]" />
                <div className="flex flex-1 flex-col gap-2 py-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
