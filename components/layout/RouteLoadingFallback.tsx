import {
  ProfileAnalyticsSkeleton,
  ProfileChannelSkeleton,
  ProfileContentSkeleton,
  ProfileDashboardSkeleton,
  ProfileHistorySkeleton,
} from "@/components/profile/ProfileSkeletons";
import { Skeleton, VideoCardSkeleton } from "@/components/ui/skeleton";

function FeedPageSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      role="status"
      aria-busy="true"
      aria-label="Loading videos"
    >
      <span className="sr-only">Loading videos…</span>
      {Array.from({ length: 8 }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}

function WatchPageSkeleton() {
  return (
    <div className="mx-auto max-w-[1754px]" role="status" aria-busy="true">
      <span className="sr-only">Loading video…</span>
      <div className="flex flex-col gap-4 xl:flex-row xl:gap-4">
        <div className="min-w-0 flex-1 xl:max-w-[calc(100%-424px)]">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="mt-3 h-7 w-3/4" />
          <Skeleton className="mt-3 h-12 w-full" />
          <Skeleton className="mt-3 h-24 w-full rounded-lg" />
        </div>
        <aside className="w-full shrink-0 xl:w-[402px]">
          <div className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-2">
                <Skeleton className="h-[94px] w-[168px] shrink-0 rounded-md" />
                <div className="flex flex-1 flex-col gap-2 py-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function ChannelPageSkeleton() {
  return (
    <div className="mx-auto max-w-6xl" role="status" aria-busy="true">
      <span className="sr-only">Loading channel…</span>
      <Skeleton className="h-48 w-full rounded-lg" />
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

function SubscriptionsPageSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Loading subscriptions…</span>
      <Skeleton className="mb-4 h-8 w-48" />
      <div className="mb-6 flex gap-3 overflow-hidden px-1 py-1">
        <Skeleton className="h-10 w-16 shrink-0 rounded-full" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-32 shrink-0 rounded-full" />
        ))}
      </div>
      <FeedPageSkeleton />
    </div>
  );
}

function SearchPageSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading search">
      <span className="sr-only">Loading search…</span>
      <Skeleton className="mb-4 h-8 w-48" />
      <Skeleton className="mb-6 h-10 w-full max-w-xl rounded-lg" />
      <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function UploadPageSkeleton() {
  return (
    <div
      className="mx-auto max-w-[1200px] py-4 md:py-8"
      role="status"
      aria-busy="true"
      aria-label="Loading upload"
    >
      <span className="sr-only">Loading upload…</span>
      <Skeleton className="mb-6 h-8 w-40" />
      <Skeleton className="aspect-video w-full max-w-2xl rounded-lg" />
      <Skeleton className="mt-6 h-10 w-full max-w-xl" />
      <Skeleton className="mt-4 h-24 w-full max-w-xl" />
    </div>
  );
}

function GenericPageSkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading page">
      <span className="sr-only">Loading…</span>
      <Skeleton className="mb-4 h-8 w-48" />
      <Skeleton className="mb-2 h-4 w-full max-w-lg" />
      <Skeleton className="h-4 w-2/3 max-w-md" />
      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/** Instant skeleton while a route’s RSC payload is loading (see NavigationPendingProvider). */
export function RouteLoadingFallback({ href }: { href: string }) {
  const path = href.split("?")[0] ?? href;

  if (path === "/" || path === "") {
    return <FeedPageSkeleton />;
  }
  if (path.startsWith("/watch/")) {
    return <WatchPageSkeleton />;
  }
  if (path.startsWith("/channel/")) {
    return <ChannelPageSkeleton />;
  }
  if (path.startsWith("/subscriptions")) {
    return <SubscriptionsPageSkeleton />;
  }
  if (path.startsWith("/search")) {
    return <SearchPageSkeleton />;
  }
  if (path.startsWith("/upload")) {
    return <UploadPageSkeleton />;
  }
  if (path === "/profile") {
    return <ProfileDashboardSkeleton />;
  }
  if (path.startsWith("/profile/content")) {
    return <ProfileContentSkeleton />;
  }
  if (path.startsWith("/profile/analytics")) {
    return <ProfileAnalyticsSkeleton />;
  }
  if (path.startsWith("/profile/history") || path.startsWith("/profile/saved")) {
    return <ProfileHistorySkeleton />;
  }
  if (path.startsWith("/profile/channel")) {
    return <ProfileChannelSkeleton />;
  }
  if (path.startsWith("/profile")) {
    return <ProfileDashboardSkeleton />;
  }

  return <GenericPageSkeleton />;
}
