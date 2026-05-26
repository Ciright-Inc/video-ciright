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
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-48 md:h-10 md:w-56" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
          <div className="flex shrink-0 gap-3">
            <Skeleton className="h-10 w-28 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-6">
          <div className="flex flex-col gap-6 lg:col-span-7">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="border-b border-border px-6 py-4">
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-11 w-full" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="min-h-[140px] w-full rounded-md" />
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="px-6 py-4">
                <Skeleton className="h-5 w-44" />
              </div>
              <div className="flex flex-col gap-6 px-6 pb-6">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-11 w-full" />
                </div>
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-11 w-full" />
                </div>
              </div>
            </div>

            <Skeleton className="h-20 w-full rounded-xl" />
          </div>

          <div className="flex flex-col gap-6 lg:col-span-5">
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <Skeleton className="aspect-video w-full rounded-none rounded-t-xl" />
              <div className="flex flex-col gap-6 p-6">
                <Skeleton className="h-24 w-full rounded-xl" />
                <div className="flex flex-col gap-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="aspect-video w-full rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
