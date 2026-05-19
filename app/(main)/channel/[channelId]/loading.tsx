import { Skeleton, VideoCardSkeleton } from "@/components/ui/skeleton";

export default function ChannelLoading() {
  return (
    <div className="mx-auto max-w-6xl">
      <Skeleton className="h-48 w-full rounded-[var(--radius-lg)]" />
      <Skeleton className="mt-4 h-24 w-24 rounded-full" />
      <Skeleton className="mt-4 h-8 w-48" />
      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
