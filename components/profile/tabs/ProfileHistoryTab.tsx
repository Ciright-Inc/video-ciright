"use client";

import Link from "next/link";
import { ClearHistoryButton } from "@/components/profile/ClearHistoryButton";
import { ProfileHistorySkeleton } from "@/components/profile/ProfileSkeletons";
import { WatchHistoryFeed } from "@/components/video/WatchHistoryFeed";
import type { WatchHistoryPage } from "@/lib/profile/watchHistoryPage";
import { useWatchHistoryInfinite } from "@/lib/queries/watch-history";

export function ProfileHistoryTab({
  initialPage,
}: {
  initialPage?: WatchHistoryPage;
}) {
  const { data, isLoading, isError } = useWatchHistoryInfinite(initialPage);
  const total = data?.pages[0]?.total ?? 0;
  const hasHistory = total > 0;

  if (isLoading) {
    return (
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">Watch history</h2>
            <p className="text-sm text-secondary-foreground">
              Videos you&apos;ve watched while signed in.
            </p>
          </div>
        </div>
        <ProfileHistorySkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-secondary-foreground">
        Could not load watch history. Try refreshing the page.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-ink">Watch history</h2>
          <p className="text-sm text-secondary-foreground">
            Videos you&apos;ve watched while signed in.
          </p>
        </div>
        {hasHistory ? <ClearHistoryButton /> : null}
      </div>

      {!hasHistory ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center">
          <p className="text-secondary-foreground">No watch history yet.</p>
          <Link
            href="/"
            className="mt-3 inline-block text-sm font-medium text-text-link no-underline hover:underline"
          >
            Browse videos
          </Link>
        </div>
      ) : (
        <WatchHistoryFeed initialPage={initialPage} />
      )}
    </div>
  );
}
