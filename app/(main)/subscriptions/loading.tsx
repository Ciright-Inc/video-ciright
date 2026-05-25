import { Skeleton, VideoCardSkeleton } from "@/components/ui/skeleton";

export default function SubscriptionsLoading() {
  return (
    <div>
      <Skeleton className="mb-4 h-8 w-48" />

      <div className="mb-6 flex gap-3 overflow-hidden px-1 py-1">
        <Skeleton className="h-10 w-16 shrink-0 rounded-full" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-32 shrink-0 rounded-full" />
        ))}
      </div>

      <Skeleton className="mb-4 h-5 w-28" />

      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
